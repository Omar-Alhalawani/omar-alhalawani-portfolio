import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFifo,clockFifo,slotOccupied} from '../src/lib/fifo.ts';

test('full and empty decisions use pre-edge occupancy',()=>{
  let state=createFifo(4);
  const first=clockFifo(state,{wrValid:true,rdReady:true,data:0xA1});
  assert.equal(first.readAccepted,false);assert.equal(first.writeAccepted,true);state=first.state;
  for(let i=1;i<4;i++)state=clockFifo(state,{wrValid:true,rdReady:false,data:i}).state;
  const full=clockFifo(state,{wrValid:true,rdReady:true,data:0xFF});
  assert.equal(full.writeAccepted,false);assert.equal(full.readAccepted,true);assert.equal(full.state.count,3);assert.equal(full.readValue,0xA1);
});
test('simultaneous accepted read/write holds occupancy and ordering',()=>{
  let state=createFifo(4);
  state=clockFifo(state,{wrValid:true,rdReady:false,data:0x12}).state;
  const both=clockFifo(state,{wrValid:true,rdReady:true,data:0x34});
  assert.equal(both.state.count,1);assert.equal(both.readValue,0x12);
  assert.equal(clockFifo(both.state,{wrValid:false,rdReady:true,data:0}).readValue,0x34);
});
test('reset empties pointers/count/output while preserving physical memory',()=>{
  const filled=clockFifo(createFifo(4),{wrValid:true,rdReady:false,data:0xA5}).state;
  const reset=clockFifo(filled,{wrValid:true,rdReady:true,data:0xFF,reset:true});
  assert.equal(reset.state.count,0);assert.equal(reset.state.wrPtr,0);assert.equal(reset.state.rdPtr,0);assert.equal(reset.state.output,0);
  assert.equal(reset.state.memory[0],0xA5);assert.equal(slotOccupied(reset.state,0),false);
});
test('long mixed traffic agrees with an independent ordered reference queue',()=>{
  let state=createFifo(8),seed=0x12345678;
  const queue:number[]=[];
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let i=0;i<1000;i++) {
    const wrValid=(random()&3)!==0,rdReady=(random()&3)!==0,data=random()&0xff;
    const readExpected=rdReady&&queue.length>0;
    const writeExpected=wrValid&&queue.length<8;
    const expected=readExpected?queue.shift():undefined;
    if(writeExpected)queue.push(data);
    const transfer=clockFifo(state,{wrValid,rdReady,data});state=transfer.state;
    assert.equal(transfer.readAccepted,readExpected);assert.equal(transfer.writeAccepted,writeExpected);
    if(readExpected)assert.equal(transfer.readValue,expected);
    assert.equal(state.count,queue.length);assert.equal(state.memory.filter((_,index)=>slotOccupied(state,index)).length,queue.length);
  }
});
test('the illustration enforces the current RTL power-of-two depth constraint',()=>{
  assert.throws(()=>createFifo(3),RangeError);assert.throws(()=>createFifo(1),RangeError);
});
