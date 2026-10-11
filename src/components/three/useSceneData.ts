import {useEffect,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3,PerspectiveCamera,MathUtils} from 'three';
import {entryFieldOfView} from '../../lib/project-entry';
import type {ProjectId} from '../../lib/project-selection';
import {useThree} from '@react-three/fiber';

export function useSceneData<T>(id:string,eventName:string,initial:T) {
  const [state,setState]=useState<T>(initial);
  const {invalidate}=useThree();
  useEffect(()=>{
    const value=document.getElementById(id)?.dataset.state;
    if(value) {try{setState(JSON.parse(value) as T);}catch{/* Keep the documented initial state. */}}
    const receive=(event:Event)=>{setState((event as CustomEvent<T>).detail);invalidate();};
    window.addEventListener(eventName,receive);invalidate();
    return()=>window.removeEventListener(eventName,receive);
  },[id,eventName,invalidate]);
  return state;
}

export function useSceneCamera(kind:'floorplan'|'detail'='detail') {
  const {camera,invalidate,size,gl}=useThree();
  const entry=useRef<{from:Vector3;target:Vector3;normal:Vector3;fov:number;started:number|null}|null>(null);
  useEffect(()=>{
    const fit=Math.max(1,1.2/(size.width/size.height)),normal=new Vector3(0,kind==='floorplan'?3.8*fit:2.7*fit,kind==='floorplan'?6.7*fit:6.2*fit);
    const idByScene:Record<string,ProjectId>={fifo:'fifo',fpga:'fpga-arithmetic',emg:'emg',lumalink:'lumalink',cubex:'cubex',daq:'mini-lysimeter'};
    const focus:Record<ProjectId,number>={fifo:.81,'fpga-arithmetic':.54,emg:.55,lumalink:.65,cubex:.6275,'mini-lysimeter':.66545};
    const scene=gl.domElement.closest<HTMLElement>('.scene-island')?.dataset.scene||'',handoff=window.__PROJECT_HANDOFF__;
    if(handoff&&handoff.id===idByScene[scene]&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const target=new Vector3(0,focus[handoff.id],0),from=target.clone().add(handoff.entry?new Vector3(...handoff.entry.cameraOffset):new Vector3(0,2.6,6.2).multiplyScalar(fit*handoff.cameraScale));
      // Match the contained retained frame's projection when the platform and
      // hero have different aspect ratios. FOV, rather than distance, preserves
      // perspective for every part of the model, including its depth.
      const fov=entryFieldOfView(handoff.entry?.sourceAspect??size.width/size.height,size.width/size.height,handoff.entry?.sourceFov??36);
      entry.current={from,target,normal,fov,started:null};camera.position.copy(from);camera.lookAt(target);
      if(camera instanceof PerspectiveCamera){camera.fov=fov;camera.updateProjectionMatrix();}
    }else{entry.current=null;camera.position.copy(normal);camera.lookAt(0,.1,0);if(camera instanceof PerspectiveCamera){camera.fov=36;camera.updateProjectionMatrix();}}
    const reveal=()=>{if(entry.current){entry.current.started=performance.now();invalidate();}};
    window.addEventListener('portfolio:handoff-reveal',reveal);invalidate();
    return()=>{window.removeEventListener('portfolio:handoff-reveal',reveal);entry.current=null;};
  },[camera,invalidate,kind,size.width,size.height,gl]);
  useFrame(()=>{
    const motion=entry.current;if(!motion||motion.started===null)return;
    const p=Math.min(1,(performance.now()-motion.started)/650),e=p*p*(3-2*p);
    camera.position.lerpVectors(motion.from,motion.normal,e);camera.lookAt(motion.target.clone().lerp(new Vector3(0,.1,0),e));
    if(camera instanceof PerspectiveCamera){camera.fov=MathUtils.lerp(motion.fov,36,e);camera.updateProjectionMatrix();}
    if(p===1)entry.current=null;
  });
}
