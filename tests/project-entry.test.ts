import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {entryFieldOfView} from '../src/lib/project-entry.ts';

test('handoff camera preserves retained pixels across aspect ratios and all six model scales',()=>{
 const scales=[[.6,1.15],[.43,1],[.45,1],[.5,1],[.71,1.15],[1,1/.55]];
 for(const [sw,sh,dw,dh] of [[1200,600,700,520],[390,390,390,340],[700,800,1000,520]])for(const [sourceScale,destinationScale] of scales){
  const delta=new Vector3(0,2.6,6.2).multiplyScalar(.72),source=new PerspectiveCamera(36,sw/sh,.1,40),destination=new PerspectiveCamera(entryFieldOfView(sw/sh,dw/dh),dw/dh,.1,40);
  source.position.copy(delta).multiplyScalar(sourceScale/destinationScale);source.lookAt(0,0,0);source.updateMatrixWorld();
  destination.position.copy(delta);destination.lookAt(0,0,0);destination.updateMatrixWorld();
  const contain=Math.min(dw/sw,dh/sh),left=(dw-sw*contain)/2,top=(dh-sh*contain)/2;
  for(const point of [[-.4,.2,-.5],[.3,.6,.4],[0,-.3,0]]){
   const a=new Vector3(...point).multiplyScalar(sourceScale).project(source),b=new Vector3(...point).multiplyScalar(destinationScale).project(destination);
   assert.ok(Math.abs(left+(a.x+1)*sw/2*contain-(b.x+1)*dw/2)<.001);
   assert.ok(Math.abs(top+(1-a.y)*sh/2*contain-(1-b.y)*dh/2)<.001);
  }
 }
});
