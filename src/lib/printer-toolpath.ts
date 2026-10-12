// Continuous, planted toolpaths. Every variant starts/ends at neutral so the
// 3-cycle variation has no position discontinuity at the powered idle boundary.
export function printerToolpath(progress:number,cycle:number):[number,number]{
 const width=cycle%3===2?.27:.48,z=cycle%3===1?.16:.09;
 const points:[[number,number],...Array<[number,number]>]=[[0,0],[-width,0],[width,0],[width,z],[-width,z],[width*.35,z],[-width*.2,z],[0,0]];
 const times=[0,.12,.36,.43,.66,.8,.89,1];
 let i=0;while(i<times.length-2&&progress>times[i+1])i++;
 const p=Math.max(0,Math.min(1,(progress-times[i])/(times[i+1]-times[i]))),ease=p*p*(3-2*p);
 return [points[i][0]+(points[i+1][0]-points[i][0])*ease,points[i][1]+(points[i+1][1]-points[i][1])*ease];
}
