import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {geographicPosition,intercontinentalPoint,globeNodes,globeRoutes,GLOBE_RADIUS,OTTAWA} from '../src/lib/contact-globe.ts';
test('geographic projection agrees with cardinal directions and Ottawa latitude',()=>{
 assert(geographicPosition(0,0,1).distanceTo(new Vector3(0,0,1))<1e-12);
 assert(geographicPosition(0,90,1).distanceTo(new Vector3(1,0,0))<1e-12);
 assert(geographicPosition(90,0,1).distanceTo(new Vector3(0,1,0))<1e-12);
 assert(Math.abs(Math.asin(geographicPosition(...OTTAWA,1).y)*180/Math.PI-45.4215)<1e-10);
});
test('every intercontinental route ends at its geographic node and stays in its great-circle plane',()=>{
 for(const [from,to] of globeRoutes){const a=globeNodes[from],b=globeNodes[to],normal=geographicPosition(a[0],a[1],1).cross(geographicPosition(b[0],b[1],1)).normalize();
  assert(intercontinentalPoint(a,b,0,.5).distanceTo(geographicPosition(a[0],a[1],GLOBE_RADIUS+.033))<1e-12);
  assert(intercontinentalPoint(a,b,1,.5).distanceTo(geographicPosition(b[0],b[1],GLOBE_RADIUS+.033))<1e-12);
  for(const t of [.1,.25,.5,.75,.9]){const p=intercontinentalPoint(a,b,t,.5);assert(Math.abs(p.dot(normal))<1e-12);assert(p.length()>GLOBE_RADIUS+.033);}
 }
});
