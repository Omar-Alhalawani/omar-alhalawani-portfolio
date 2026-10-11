import {MathUtils,Vector3} from 'three';
export const GLOBE_RADIUS=1.72;
export type GeographicPoint=readonly [number,number];
export const OTTAWA:GeographicPoint=[45.4215,-75.6972];
export const globeNodes={ottawa:OTTAWA,europe:[48.86,2.35],africa:[-1.29,36.82],asia:[28.61,77.21],southAmerica:[-23.55,-46.63],oceania:[-33.87,151.21]} satisfies Record<string,GeographicPoint>;
export const globeRoutes=[['ottawa','europe'],['ottawa','southAmerica'],['europe','africa'],['africa','asia'],['asia','oceania'],['southAmerica','africa']] as const;
export function geographicPosition(lat:number,lon:number,radius=GLOBE_RADIUS){const a=MathUtils.degToRad(lat),b=MathUtils.degToRad(lon);return new Vector3(radius*Math.cos(a)*Math.sin(b),radius*Math.sin(a),radius*Math.cos(a)*Math.cos(b));}
export function intercontinentalPoint(from:GeographicPoint,to:GeographicPoint,t:number,height:number,target=new Vector3()){
 const a=geographicPosition(...from,1),b=geographicPosition(...to,1),angle=Math.acos(MathUtils.clamp(a.dot(b),-1,1));
 const denominator=Math.sin(angle);
 if(Math.abs(denominator)<1e-6)target.copy(a).lerp(b,t).normalize();
 else target.copy(a).multiplyScalar(Math.sin((1-t)*angle)/denominator).addScaledVector(b,Math.sin(t*angle)/denominator);
 return target.multiplyScalar(GLOBE_RADIUS+.033+Math.sin(t*Math.PI)*height);
}
