import {useEffect,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
// Advance only a handful of stage changes; each engagement runs once and settles.
export function useMicroSequence(active:boolean,reducedMotion:boolean,steps=5,duration=3.5,key='',trigger?:string){
 const clock=useRef(0),stageRef=useRef(-1),progress=useRef(0),[stage,setStage]=useState(-1);const {invalidate,gl}=useThree();
 useEffect(()=>{clock.current=0;stageRef.current=-1;setStage(-1);invalidate();},[active,invalidate,trigger]);
 useFrame((_,delta)=>{
  if(active&&!reducedMotion)clock.current=Math.min(duration,clock.current+Math.min(delta,.1));
  progress.current=reducedMotion?0:clock.current/duration;
  const next=!active?-1:reducedMotion?steps:Math.min(steps,Math.floor(progress.current*steps));
  if(key&&window.__PORTFOLIO_PROFILE__){const kind=gl.domElement.closest<HTMLElement>('.scene-island')?.dataset.scene||'';const sample=window.__PORTFOLIO_PROFILE__.scenes[kind];if(sample){sample.activity??={};sample.activity[key]={stage:next,progress:progress.current,running:active&&!reducedMotion&&next>=0&&next<steps};}}
  if(next!==stageRef.current){stageRef.current=next;setStage(next);}
 });
 return {stage,progress,running:active&&!reducedMotion&&stage>=0&&stage<steps};
}
export function useSectionActivation(name:string){
 const [active,setActive]=useState(false);
 useEffect(()=>{
  const relevant=()=>Boolean(document.querySelector(`[data-signal-section="${name}"][data-signal-start]`))||document.body.dataset.signalSection===name;
  if(relevant())setActive(true);
  const start=(e:Event)=>{if((e as CustomEvent<string>).detail===name)setActive(true);};
  window.addEventListener('portfolio:section-signal',start);return()=>window.removeEventListener('portfolio:section-signal',start);
 },[name]);return active;
}
