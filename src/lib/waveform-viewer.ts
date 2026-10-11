import {onPage} from './page-lifecycle';
import {valueAt,waveValue,visibleChanges,signalHelp,type WaveData} from './fifo-waveform';
let initialized=false;
export function initializeWaveforms(){if(initialized)return;initialized=true;
 onPage(signal=>{
  const cleanups:(()=>void)[]=[];
  document.querySelectorAll<HTMLElement>('[data-waveform]').forEach(host=>{
   const data=JSON.parse(host.dataset.waveData!) as WaveData,canvas=host.querySelector<HTMLCanvasElement>('canvas')!,ctx=canvas.getContext('2d')!;
   const slider=host.querySelector<HTMLInputElement>('[data-wave-start]')!,windowInput=host.querySelector<HTMLSelectElement>('[data-wave-window]')!,output=host.querySelector<HTMLOutputElement>('[data-wave-time]')!,toggle=host.querySelector<HTMLButtonElement>('[data-inspect-toggle]')!,list=host.querySelector<HTMLElement>('.probe-list')!,explanation=host.querySelector<HTMLElement>('[data-probe-explanation]')!;
   let start=0,span=160,cursor=0,inspect=false,selected='',highlight:string[]=[],eventIndex=-1,renders=0;
   const left=124,top=32,row=37;
   const probe=(name:string)=>{
    selected=name;explanation.hidden=!inspect||!name;explanation.textContent=name?`${name.toUpperCase()} — ${signalHelp[name]}`:'';
    list.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.probe===name)));
    const region=name.startsWith('wr')||name==='din'?'write':name.startsWith('rd')||name==='dout'?'read':'status';
    document.querySelector<HTMLElement>('.architecture-diagram')?.setAttribute('data-probe',inspect&&name?region:'');
    window.dispatchEvent(new CustomEvent('portfolio:fifo-probe',{detail:{signal:name,enabled:inspect&&Boolean(name)}}));
   };
   const render=()=>{
    const width=canvas.clientWidth,height=530,dpr=Math.min(devicePixelRatio,2);if(!width)return;
    if(canvas.width!==Math.round(width*dpr)||canvas.height!==height*dpr){canvas.width=Math.round(width*dpr);canvas.height=height*dpr;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);const end=start+span,sx=(t:number)=>left+(t-start)/span*(width-left-12);
    if(eventIndex>=0){const e=data.events[eventIndex];ctx.fillStyle='#ffbd5910';ctx.fillRect(Math.max(left,sx(e.start)),top,Math.max(0,Math.min(width,sx(e.end))-Math.max(left,sx(e.start))),height-top);}
    ctx.font='10px monospace';ctx.lineWidth=1;
    for(let t=Math.ceil(start/(span/8))*(span/8);t<=end;t+=span/8){ctx.strokeStyle='#253038';ctx.beginPath();ctx.moveTo(sx(t),top);ctx.lineTo(sx(t),height-10);ctx.stroke();ctx.fillStyle='#83949f';ctx.fillText(String(Math.round(t)),sx(t)-8,18);}
    data.signals.forEach((item,i)=>{
     const y=top+i*row,color=item.name.startsWith('rd')||item.name==='dout'?'#b5d6e2':'#ffbd59';
     if(highlight.includes(item.name)||inspect&&selected===item.name){ctx.fillStyle='#ffbd5910';ctx.fillRect(0,y,width,row);}
     ctx.fillStyle='#d9e0e0';ctx.fillText(item.name,8,y+13);ctx.fillStyle=color;ctx.fillText(waveValue(valueAt(item,cursor),item.bits),8,y+27);
     const values=visibleChanges(item,start,end);ctx.strokeStyle=color;ctx.lineWidth=1.5;
     for(let k=0;k<values.length-1;k++){
      const [t,v]=values[k],x=sx(t),x2=sx(values[k+1][0]);ctx.strokeStyle=/[xz]/i.test(v)?'#677078':color;ctx.beginPath();
      if(item.bits===1){const yy=y+(v==='1'?7:v==='0'?27:17);ctx.moveTo(x,yy);ctx.lineTo(x2,yy);if(k){ctx.moveTo(x,y+7);ctx.lineTo(x,y+27);}}
      else{ctx.moveTo(x,y+17);ctx.lineTo(x+Math.min(3,(x2-x)/3),y+7);ctx.lineTo(x2-3,y+7);ctx.lineTo(x2,y+17);ctx.lineTo(x2-3,y+27);ctx.lineTo(x+3,y+27);ctx.closePath();if(x2-x>48){ctx.fillStyle=color;ctx.fillText(waveValue(v,item.bits).split(' ')[0],x+7,y+21);}}
      ctx.stroke();
     }
    });
    const x=sx(cursor);if(x>=left&&x<=width){ctx.strokeStyle='#dbe6e8';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,height-10);ctx.stroke();}
    output.textContent=`t=${Math.round(cursor)} simulation ticks`;host.dataset.waveRenders=String(++renders);host.dataset.waveStart=String(start);
   };
   const setStart=(n:number)=>{start=Math.max(0,Math.min(data.end-span,n));slider.value=String(start);cursor=Math.max(start,Math.min(start+span,cursor));render();};
   const setInspect=(enabled:boolean)=>{inspect=enabled;toggle.setAttribute('aria-pressed',String(enabled));list.hidden=!enabled;probe(enabled?selected||'wr_ready':'');render();};
   toggle.addEventListener('click',()=>setInspect(!inspect),{signal});
   list.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{const show=()=>{probe(b.dataset.probe!);render();};b.addEventListener('focus',show,{signal});b.addEventListener('pointerenter',show,{signal});b.addEventListener('click',show,{signal});});
   slider.addEventListener('input',()=>setStart(Number(slider.value)),{signal});
   windowInput.addEventListener('change',()=>{span=Number(windowInput.value);slider.max=String(Math.max(0,data.end-span));setStart(start);},{signal});
   host.querySelectorAll<HTMLButtonElement>('[data-wave-event]').forEach(b=>b.addEventListener('click',()=>{
    eventIndex=Number(b.dataset.waveEvent);const e=data.events[eventIndex];highlight=e.signals;cursor=e.start;setStart(e.start-span*.2);
    host.querySelectorAll('[data-wave-event]').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));
    host.querySelector('[data-wave-description]')!.textContent=`${e.label} · ticks ${e.start}–${e.end}. ${e.description}`;
    if(inspect)probe(e.signals.includes('full')?'full':e.signals[0]);render();
   },{signal}));
   let gesture:{x:number;y:number;start:number;id:number;claimed:boolean;touch:boolean}|undefined;
   canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;gesture={x:e.clientX,y:e.clientY,start,id:e.pointerId,claimed:e.pointerType==='mouse',touch:e.pointerType!=='mouse'};if(gesture.claimed)canvas.setPointerCapture(e.pointerId);},{signal});
   canvas.addEventListener('pointermove',e=>{
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(gesture){const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.claimed&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)) {gesture.claimed=true;canvas.setPointerCapture(e.pointerId);}if(gesture.claimed){setStart(gesture.start-dx/(r.width-left-12)*span);return;}}
    cursor=Math.max(start,Math.min(start+span,start+(x-left)/(r.width-left-12)*span));const i=Math.floor((y-top)/row);if(inspect&&data.signals[i])probe(data.signals[i].name);render();
   },{signal});
   const end=()=>{gesture=undefined;};canvas.addEventListener('pointerup',end,{signal});canvas.addEventListener('pointercancel',end,{signal});canvas.addEventListener('lostpointercapture',end,{signal});
   canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();setStart(e.key==='Home'?0:start+(e.key==='ArrowRight'?1:-1)*span/8);}},{signal});
   const resize=new ResizeObserver(render);resize.observe(canvas);render();cleanups.push(()=>{resize.disconnect();window.dispatchEvent(new CustomEvent('portfolio:fifo-probe',{detail:{signal:'',enabled:false}}));});
  });return()=>cleanups.forEach(fn=>fn());
 });
}
