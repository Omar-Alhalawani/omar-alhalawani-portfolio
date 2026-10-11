import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseFifoVcd,valueAt,visibleChanges} from '../src/lib/fifo-waveform.ts';
const raw=readFileSync('public/evidence/fifo/directed-tests.vcd','utf8'),data=parseFifoVcd(raw);
test('waveform source matches recorded provenance and exposes actual RTL names',()=>{
 const provenance=JSON.parse(readFileSync('public/evidence/fifo/provenance.json','utf8'));
 assert.equal(createHash('sha256').update(raw).digest('hex'),provenance.vcdSHA256);
 assert.ok(data.signals.some(s=>s.name==='din'));assert.ok(data.signals.some(s=>s.name==='dout'));assert.ok(data.signals.some(s=>s.name==='wr_ptr'));
 assert.ok(!data.signals.some(s=>s.name==='wr_data'));
});
test('annotations are supported by recorded full, empty, reset, and pointer states',()=>{
 const sig=(name:string)=>data.signals.find(s=>s.name===name)!;
 const full=data.events.find(e=>e.label==='FULL')!;
 assert.equal(valueAt(sig('full'),full.start),'1');assert.equal(parseInt(valueAt(sig('count'),full.start),2),4);assert.equal(valueAt(sig('wr_ready'),full.start),'0');
 const empty=data.events.find(e=>e.label==='EMPTY')!;assert.equal(valueAt(sig('empty'),empty.start),'1');assert.equal(valueAt(sig('rd_valid'),empty.start),'0');
 const reset=data.events.find(e=>e.label==='RESET')!;assert.equal(valueAt(sig('rst_n'),reset.start),'0');
 assert.ok(data.events.some(e=>e.label==='WRITE WRAP'));assert.ok(data.events.some(e=>e.label==='READ WRAP'));
 assert.ok(!data.events.some(e=>e.label.includes('SIMULTANEOUS')));
});
test('viewport clipping retains entering value and excludes offscreen transitions',()=>{
 const signal={name:'count',bits:3,changes:[[0,'0'],[10,'1'],[20,'10'],[30,'11']] as [number,string][]};
 assert.deepEqual(visibleChanges(signal,15,25),[[15,'1'],[20,'10'],[25,'10']]);assert.equal(valueAt(signal,10),'1');
});
