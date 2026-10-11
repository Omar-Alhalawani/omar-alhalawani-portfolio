import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils, Vector2 } from 'three';
import {motion} from './motion';
import ChipLayers from './ChipLayers';
import type { SceneProps } from './types';

export default function HeroScene({ reducedMotion, tier }: SceneProps) {
  const form=useRef<Group>(null);
  const progress=useRef(0),engagement=useRef(0),engaged=useRef(false);
  const pointer=useRef(new Vector2());
  const time=useRef(0);
  const target=useRef(new Vector2());
  const { camera, invalidate, viewport }=useThree();
  useEffect(()=>{
    camera.position.set(0,2.45,7.5);camera.lookAt(0,0,0);
    const surface=document.querySelector<HTMLElement>('[data-hero-surface]');
    const move=(event:PointerEvent)=>{
      if(reducedMotion||event.pointerType!=='mouse'||!surface)return;
      const rect=surface.getBoundingClientRect();
      engaged.current=true;target.current.set(MathUtils.clamp((event.clientX-rect.left)/rect.width*2-1,-1,1),MathUtils.clamp((event.clientY-rect.top)/rect.height*2-1,-1,1));
      invalidate();
    };
    const neutral=()=>{engaged.current=false;target.current.set(0,0);invalidate();};
    surface?.addEventListener('pointermove',move,{passive:true});
    surface?.addEventListener('pointerleave',neutral);
    window.addEventListener('blur',neutral);
    return()=>{surface?.removeEventListener('pointermove',move);surface?.removeEventListener('pointerleave',neutral);window.removeEventListener('blur',neutral);};
  },[camera,invalidate,reducedMotion]);
  useFrame((_,delta)=>{
    if(!form.current) return;
    const dt=Math.min(delta,.1);
    if(!reducedMotion)time.current+=dt;
    const layer=0;
    engagement.current=MathUtils.damp(engagement.current,engaged.current&&!reducedMotion?1:0,motion.light,dt);
    pointer.current.x=MathUtils.damp(pointer.current.x,target.current.x,motion.pose,dt);
    pointer.current.y=MathUtils.damp(pointer.current.y,target.current.y,motion.pose,dt);
    const px=reducedMotion||tier==='low'?0:pointer.current.x;
    const py=reducedMotion||tier==='low'?0:pointer.current.y;
    const settle=(value:number,target:number,speed:number)=>reducedMotion?target:MathUtils.damp(value,target,speed,dt);
    form.current.position.y=settle(form.current.position.y,layer*.72,4);
    form.current.scale.setScalar(Math.min(1.18,viewport.width/5.25));
    form.current.rotation.x=settle(form.current.rotation.x,.22+layer*.06+py*.027+Math.sin(time.current*.19)*.012,4);
    form.current.rotation.y=settle(form.current.rotation.y,-.45+px*.04+Math.sin(time.current*.13)*.018,4);
    form.current.rotation.z=settle(form.current.rotation.z,-.04+Math.sin(time.current*.16)*.009,4);
    camera.position.x=settle(camera.position.x,layer*.2+px*.07,3);
    camera.position.y=settle(camera.position.y,2.45+layer*.5-py*.06,3);
    camera.position.z=settle(camera.position.z,7.5+layer*.2,3);
    camera.lookAt(0,layer*.85,0);
    const sample=window.__PORTFOLIO_PROFILE__?.scenes.hero;if(sample)sample.pose=[form.current.rotation.x,form.current.rotation.y,form.current.rotation.z,px,py,layer,time.current];
  });
  return <group ref={form} rotation={[.22,-.45,-.04]}>
    <ChipLayers progress={progress} active={2} reducedMotion={reducedMotion} tier={tier} pointer={pointer} engagement={engagement} />
  </group>;
}
