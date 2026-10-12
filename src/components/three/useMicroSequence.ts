import {useEffect,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {sequenceAt,type SequenceOptions} from '../../lib/micro-sequence';
// Opt-in loops reuse the existing frame clock; entry sequences remain one-shot.
export function useMicroSequence(active:boolean,reducedMotion:boolean,steps=5,duration=3.5,key='',trigger?:string,{loop=false,pause=0}:SequenceOptions={}){
 const clock=useRef(0),resuming=useRef(true),stageRef=useRef(-1),progress=useRef(0),[stage,setStage]=useState(-1);const {invalidate,gl,frameloop}=useThree();
 useEffect(()=>{clock.current=0;resuming.current=true;progress.current=0;stageRef.current=-1;setStage(-1);invalidate();},[active,invalidate,trigger,loop,pause]);
 useEffect(()=>{resuming.current=true;},[frameloop]);
 useFrame((state,delta)=>{
  if(active&&!reducedMotion&&!document.hidden&&state.frameloop==='always'){
   // Discard the first delta after resuming; subsequent deltas preserve real pacing even at low FPS.
   const elapsed=resuming.current?0:delta;resuming.current=false;
   clock.current=loop?clock.current+elapsed:Math.min(duration,clock.current+elapsed);
  }else resuming.current=true;
  const next=sequenceAt(clock.current,active,reducedMotion,steps,duration,{loop,pause});progress.current=next.progress;
  if(key&&window.__PORTFOLIO_PROFILE__){const kind=gl.domElement.closest<HTMLElement>('.scene-island')?.dataset.scene||'';const sample=window.__PORTFOLIO_PROFILE__.scenes[kind];if(sample){sample.activity??={};sample.activity[key]=next;}}
  if(next.stage!==stageRef.current){stageRef.current=next.stage;setStage(next.stage);}
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
