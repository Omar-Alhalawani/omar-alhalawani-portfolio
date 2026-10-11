// The retained frame uses object-fit: contain. Expanding vertical FOV when the
// hero is taller preserves the model's pixel projection, including perspective.
export function entryFieldOfView(sourceAspect:number,targetAspect:number,sourceFov=36){
 return 2*Math.atan(Math.tan(sourceFov*Math.PI/360)*Math.max(1,sourceAspect/targetAspect))*180/Math.PI;
}
