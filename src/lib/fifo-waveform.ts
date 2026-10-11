export type WaveChange=[number,string];
export interface WaveSignal{name:string;bits:number;changes:WaveChange[]}
export interface WaveEvent{label:string;start:number;end:number;signals:string[];description:string}
export interface WaveData{end:number;signals:WaveSignal[];events:WaveEvent[];timescale:string}
export const signalHelp:Record<string,string>={clk:'Shared clock. Transfers and synchronous reset are sampled on the rising edge.',rst_n:'Active-low synchronous reset clears count, pointers, and registered output; memory is not cleared.',wr_valid:'Producer has data. Write accepted at a rising edge when wr_valid && wr_ready.',wr_ready:'High when count < DEPTH. The FIFO can accept a write.',din:'8-bit write data, captured into mem[wr_ptr] on an accepted write.',rd_valid:'High when count > 0. A read can be accepted when rd_ready is also high.',rd_ready:'Consumer request. Read accepted at a rising edge when rd_valid && rd_ready.',dout:'Registered read output. Updated after an accepted read; not a combinational peek.',count:'Occupancy count. Increments for write only, decrements for read only; unchanged for both or neither.',full:'Asserted when count reaches DEPTH (4 in this recording).',empty:'Asserted when count is zero.',wr_ptr:'Next write address. Advances on accepted writes and wraps at DEPTH.',rd_ptr:'Next read address. Advances on accepted reads and wraps at DEPTH.'};
export function valueAt(signal:WaveSignal,time:number){let lo=0,hi=signal.changes.length;while(lo<hi){const mid=(lo+hi)>>>1;if(signal.changes[mid][0]<=time)lo=mid+1;else hi=mid;}return lo?signal.changes[lo-1][1]:'x';}
export function waveValue(value:string,bits:number){if(/[xz]/i.test(value))return value.toUpperCase();const n=parseInt(value,2);return bits===1?String(n):`0x${n.toString(16).toUpperCase().padStart(Math.ceil(bits/4),'0')} (${n})`;}
export function visibleChanges(signal:WaveSignal,start:number,end:number):WaveChange[]{return [[start,valueAt(signal,start)],...signal.changes.filter(([t])=>t>start&&t<end),[end,valueAt(signal,end)]];}
export function parseFifoVcd(text:string):WaveData{
 const [header,body]=text.split('$enddefinitions $end');if(!body)throw Error('Missing VCD definitions');
 const scope:string[]=[],symbols=new Map<string,WaveSignal>(),byName=new Map<string,WaveSignal>();
 for(const line of header.split('\n')){const words=line.trim().split(/\s+/);if(words[0]==='$scope')scope.push(words[2]);else if(words[0]==='$upscope')scope.pop();else if(words[0]==='$var'){
  const name=words[4];if(!(name in signalHelp))continue;
  if(scope.length>1&&!['wr_ptr','rd_ptr'].includes(name))continue;
  const item={name,bits:Number(words[2]),changes:[] as WaveChange[]};symbols.set(words[3],item);byName.set(name,item);
 }}
 let time=0;for(const raw of body.split('\n')){const line=raw.trim();if(line.startsWith('#'))time=Number(line.slice(1));else{
  const match=/^b([01xz]+)\s+(\S+)$/.exec(line)||/^([01xz])(\S+)$/.exec(line);if(!match)continue;
  const item=symbols.get(match[2]);if(item){const changes=item.changes;if(changes.at(-1)?.[0]===time)changes[changes.length-1]=[time,match[1]];else changes.push([time,match[1]]);}
 }}
 const names=['clk','rst_n','wr_valid','wr_ready','din','rd_valid','rd_ready','dout','count','full','empty','wr_ptr','rd_ptr'];const signals=names.flatMap(n=>byName.has(n)?[byName.get(n)!]:[]);
 const get=(n:string,t:number)=>valueAt(byName.get(n)!,t);const events:WaveEvent[]=[];
 const reset=byName.get('rst_n')!.changes.find(([t,v])=>t>0&&v==='0');if(reset){const release=byName.get('rst_n')!.changes.find(([t,v])=>t>reset[0]&&v==='1');events.push({label:'RESET',start:reset[0],end:release?.[0]??reset[0]+20,signals:['clk','rst_n','count','wr_ptr','rd_ptr'],description:'Active-low synchronous reset is held across two rising clock edges.'});}
 const firstFull=byName.get('full')!.changes.find(([,v])=>v==='1');if(firstFull){const t=firstFull[0],lastEmpty=byName.get('count')!.changes.filter(([at,v])=>at<t&&parseInt(v,2)===0).at(-1)?.[0]??0;const end=byName.get('full')!.changes.find(([at,v])=>at>t&&v==='0')?.[0]??t+10;const drained=byName.get('empty')!.changes.find(([at,v])=>at>t&&v==='1')?.[0]??end;
 events.push({label:'FILL',start:lastEmpty,end:t,signals:['wr_valid','wr_ready','din','count'],description:'Four recorded writes fill the FIFO after the sanity sequence.'},{label:'FULL',start:t,end,signals:['full','count','wr_ready'],description:'Count reaches 4; full asserts and wr_ready deasserts.'},{label:'DRAIN',start:end,end:drained,signals:['rd_ready','rd_valid','dout','count'],description:'Recorded reads drain the queue through the registered output.'},{label:'EMPTY',start:drained,end:drained+10,signals:['empty','count','rd_valid'],description:'Count returns to zero; empty asserts and rd_valid deasserts.'});}
 // Pointer wrap is directly evidenced by address 3 -> 0 while out of reset.
 for(const name of ['wr_ptr','rd_ptr']){const item=byName.get(name)!;const wrap=item.changes.find(([t,v],i)=>i>0&&parseInt(v,2)===0&&parseInt(item.changes[i-1][1],2)===3&&get('rst_n',t)==='1');if(wrap)events.push({label:name==='wr_ptr'?'WRITE WRAP':'READ WRAP',start:wrap[0]-10,end:wrap[0]+10,signals:[name,'count'],description:`Recorded ${name} changes from address 3 to 0.`});}
 return {signals,events,end:time,timescale:header.match(/\$timescale\s+([^$]+)/)?.[1].trim()??'unknown'};
}
