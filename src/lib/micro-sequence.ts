export interface SequenceOptions { loop?:boolean; pause?:number; }
// Pure timeline math keeps pauses and one-shot completion independently testable.
export function sequenceAt(elapsed:number,active:boolean,reducedMotion:boolean,steps:number,duration:number,{loop=false,pause=0}:SequenceOptions={}){
 const enabled=active&&!reducedMotion,cycleLength=duration+Math.max(0,pause);
 const cycle=loop?Math.floor(elapsed/cycleLength):0;
 const time=loop?elapsed%cycleLength:Math.min(duration,elapsed);
 const progress=!enabled?0:Math.min(1,time/duration);
 const stage=!active?-1:reducedMotion?steps:Math.min(steps,Math.floor(progress*steps));
 return {progress,stage,running:enabled&&time<duration,enabled,looping:enabled&&loop,cycle};
}
