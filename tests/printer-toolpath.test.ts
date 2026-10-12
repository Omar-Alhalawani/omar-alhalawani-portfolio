import test from 'node:test';
import assert from 'node:assert/strict';
import {printerToolpath} from '../src/lib/printer-toolpath.ts';
test('toolpath variants settle continuously through neutral cycle boundaries',()=>{
 for(let cycle=0;cycle<6;cycle++){
  assert.deepEqual(printerToolpath(0,cycle),[0,0]);assert.deepEqual(printerToolpath(1,cycle),[0,0]);
  let previous=printerToolpath(0,cycle);
  for(let i=1;i<=1000;i++){const point=printerToolpath(i/1000,cycle);assert.ok(Math.hypot(point[0]-previous[0],point[1]-previous[1])<.012);assert.ok(Math.abs(point[0])<=.48&&Math.abs(point[1])<=.16);previous=point;}
 }
 assert.notDeepEqual(printerToolpath(.43,0),printerToolpath(.43,1));assert.notDeepEqual(printerToolpath(.36,0),printerToolpath(.36,2));assert.deepEqual(printerToolpath(.43,0),printerToolpath(.43,3));
});
