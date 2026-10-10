import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Mesh} from 'three';
import {Board,Block} from '../Board';
import {useSceneCamera} from '../useSceneData';
import type {SceneProps} from '../types';

export function Printer({reducedMotion,scale=1,active=true}:{reducedMotion:boolean;scale?:number;active?:boolean}) {
  const head=useRef<Mesh>(null),time=useRef(0);
  useFrame((_,delta)=>{
    if(!head.current)return;
    if(active&&!reducedMotion)time.current+=Math.min(delta,.05);
    head.current.position.x=reducedMotion?0:Math.sin(time.current*.9)*.7;
  });
  return <group scale={scale}>
    {[-1,1].flatMap(x=>[-.7,.7].map(z=><mesh key={`${x}-${z}`} position={[x,.95,z]}><boxGeometry args={[.07,1.9,.07]}/><meshStandardMaterial color="#8b959b" metalness={.75} roughness={.35}/></mesh>))}
    <Block position={[0,.12,0]} size={[2.1,.13,1.55]}/>
    <mesh position={[0,1.75,0]}><boxGeometry args={[2.15,.08,.08]}/><meshStandardMaterial color="#899397" metalness={.6} roughness={.3}/></mesh>
    <mesh ref={head} position={[0,1.59,0]}><boxGeometry args={[.24,.27,.28]}/><meshStandardMaterial color="#414a4f" emissive="#ffbd59" emissiveIntensity={active?.17:.02}/></mesh>
    <mesh position={[0,.21,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.35,.85]}/><meshBasicMaterial color="#514735" transparent opacity={.65}/></mesh>
  </group>;
}
export default function CubexScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group position={[0,-.5,0]} rotation={[0,-.3,0]}><Board width={3.8} depth={2.9}/><Printer reducedMotion={reducedMotion}/></group>;
}
