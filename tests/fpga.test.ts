import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialFpga,operateFpga,arithmetic} from '../src/lib/fpga.ts';

test('operand capture is stable after DIP switches change',()=>{
  const captured=operateFpga({...initialFpga,switches:42},'load-a');
  const next=operateFpga({...captured,switches:7},'load-b');
  assert.equal(next.a,42);assert.equal(next.b,7);assert.equal(arithmetic(next).result,49);
});
test('the ninth bit is retained internally and LEDs display only the low eight',()=>{
  const result=arithmetic({...initialFpga,a:255,b:1});assert.equal(result.intermediate,256);assert.equal(result.result,0);
  const sub=arithmetic({...initialFpga,a:0,b:1,subtract:true});assert.equal(sub.intermediate,511);assert.equal(sub.result,255);
});
test('clear resets registers and mode without changing physical DIP switches',()=>{
  const clear=operateFpga({...initialFpga,a:90,b:3,subtract:true,switches:123},'clear');
  assert.deepEqual(clear,{a:0,b:0,subtract:false,switches:123});
});
