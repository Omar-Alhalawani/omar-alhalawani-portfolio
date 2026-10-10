import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils, Vector2 } from 'three';
import SiliconForm from './SiliconForm';
import ChipLayers from './ChipLayers';
import type { SceneProps } from './types';

export default function HeroScene({ reducedMotion, tier }: SceneProps) {
  const form=useRef<Group>(null);
  const progress=useRef(0);
  const pointer=useRef(new Vector2());
  const time=useRef(0);
  const [active,setActive]=useState(2);
  const { camera, invalidate, viewport }=useThree();
  useEffect(()=>{
    const sequence=document.getElementById('silicon-sequence');
    const scroll=()=>{
      if(!sequence) return;
      const rect=sequence.getBoundingClientRect();
      progress.current=MathUtils.clamp(-rect.top/Math.max(1,rect.height-innerHeight),0,1);
      invalidate();
    };
    const move=(event:PointerEvent)=>{
      if(event.pointerType==='mouse') pointer.current.set((event.clientX/innerWidth-.5)*2,(event.clientY/innerHeight-.5)*2);
    };
    const select=(event:Event)=>{setActive((event as CustomEvent<number>).detail);invalidate();};
    scroll();
    window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('resize',scroll,{passive:true});
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('portfolio:layer',select);
    return()=>{window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);window.removeEventListener('pointermove',move);window.removeEventListener('portfolio:layer',select);};
  },[invalidate]);
  useFrame((_,delta)=>{
    if(!form.current) return;
    const dt=Math.min(delta,.1);
    if(!reducedMotion)time.current+=dt;
    const p=reducedMotion?0:progress.current;
    const layer=MathUtils.smoothstep(p,.38,.94);
    const px=reducedMotion||tier==='low'?0:pointer.current.x;
    const py=reducedMotion||tier==='low'?0:pointer.current.y;
    form.current.position.y=MathUtils.damp(form.current.position.y,layer*.72,4,dt);
    form.current.scale.setScalar(Math.min(1.16,viewport.width/4.1));
    form.current.rotation.x=MathUtils.damp(form.current.rotation.x,.3+layer*.1+py*.035,4,dt);
    form.current.rotation.y=MathUtils.damp(form.current.rotation.y,-.38+px*.055,4,dt);
    form.current.rotation.z=MathUtils.damp(form.current.rotation.z,-.16+Math.sin(time.current*.16)*.012,4,dt);
    camera.position.x=MathUtils.damp(camera.position.x,layer*.2+px*.07,3,dt);
    camera.position.y=MathUtils.damp(camera.position.y,1.35+layer*.5-py*.06,3,dt);
    camera.position.z=MathUtils.damp(camera.position.z,7.5+layer*.2,3,dt);
    camera.lookAt(0,-layer*.08,0);
  });
  return <group ref={form} rotation={[.3,-.38,-.16]}>
    <SiliconForm progress={progress} reducedMotion={reducedMotion} tier={tier} />
    <ChipLayers progress={progress} active={active} reducedMotion={reducedMotion} tier={tier} />
  </group>;
}
