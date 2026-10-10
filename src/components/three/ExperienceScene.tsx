import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {MeshStandardMaterial} from 'three';
import {useSceneCamera} from './useSceneData';
import {Board,Block} from './Board';
import {Plate,Label,AMBER} from './Hardware';
import SignalTrace from './SignalTrace';
import type {SceneProps} from './types';

export default function ExperienceScene({reducedMotion,tier}:SceneProps) {
  useSceneCamera('floorplan');
  const materials=useRef<(MeshStandardMaterial|null)[]>([]),time=useRef(0);
  useFrame((_,delta)=>{
    if(!reducedMotion)time.current+=Math.min(delta,.05);
    const stage=reducedMotion?3:Math.floor(time.current*.6)%4;
    materials.current.forEach((m,i)=>{if(m)m.emissiveIntensity=i===stage?.36:.025;});
  });
  return <group rotation={[0,-.12,0]}>
    <Board width={5.1} depth={2.8}/>
    {[-1.8,-.6,.6,1.8].map((x,i)=><group key={x} position={[x,.06,0]}>
      <Plate width={.92} depth={1.28} height={.1} rim bolts={tier!=='low'}/>
      <Block position={[0,.34,-.06]} size={[.76,.5,.86]}/>
      <mesh position={[0,.595,-.06]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.62,.67]}/><meshStandardMaterial ref={m=>{materials.current[i]=m;}} color="#413627" metalness={.7} roughness={.28} emissive={AMBER} emissiveIntensity={.025}/></mesh>
      <Label text={['SPEC','RTL','TESTBENCH','VERIFY'][i]} position={[0,.603,-.08]} width={.68}/>
      <Label text={i===3?'PASS':'0'+(i+1)} position={[0,.067,.51]} width={.43} color={AMBER}/>
    </group>)}
    {[-1.8,-.6,.6].map((x,i)=><SignalTrace key={x} reducedMotion={reducedMotion} offset={i*.2} points={[[x,.07,.83],[x+.35,.07,.83],[x+.35,.07,.26],[x+.85,.07,.26],[x+.85,.07,.83],[x+1.2,.07,.83]]}/>)}
    <SignalTrace reducedMotion={reducedMotion} offset={.5} points={[[1.8,.025,-.8],[1.8,.025,-1.14],[-1.8,.025,-1.14],[-1.8,.025,-.8]]}/>
  </group>;
}
