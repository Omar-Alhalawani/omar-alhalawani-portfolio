import test from 'node:test';
import assert from 'node:assert/strict';
import {sequenceAt} from '../src/lib/micro-sequence.ts';
test('default one-shot stays settled after completion',()=>{
 for(const t of [3.2,6,60])assert.deepEqual(sequenceAt(t,true,false,4,3.2),{progress:1,stage:4,running:false,enabled:true,looping:false,cycle:0});
});
test('loop settles through pause then restarts across many cycles',()=>{
 const at=(t:number)=>sequenceAt(t,true,false,4,3.2,{loop:true,pause:1.7});
 assert.equal(at(1.6).stage,2);assert.equal(at(1.6).running,true);
 for(const t of [3.2,4,4.89]){assert.equal(at(t).progress,1);assert.equal(at(t).running,false);assert.equal(at(t).looping,true);}
 const resumed=at(4.95);assert.equal(resumed.cycle,1);assert.equal(resumed.stage,0);assert.equal(resumed.running,true);
 assert.equal(at(4.9*100+.1).cycle,100);
});
test('inactive and reduced motion never enable autonomous looping',()=>{
 const inactive=sequenceAt(2,false,false,5,4.8,{loop:true,pause:2.8});assert.equal(inactive.stage,-1);assert.equal(inactive.progress,0);assert.equal(inactive.running,false);
 const reduced=sequenceAt(2,true,true,5,4.8,{loop:true,pause:2.8});assert.equal(reduced.stage,5);assert.equal(reduced.progress,0);assert.equal(reduced.running,false);assert.equal(reduced.looping,false);
});
