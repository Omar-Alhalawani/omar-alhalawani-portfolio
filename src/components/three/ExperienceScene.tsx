import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {MeshStandardMaterial} from 'three';
import {useSceneCamera} from './useSceneData';
import {CircuitBoard,Processor,Connector,SystemBed,Parts} from './Circuitry';
import {Plate,Label,AMBER} from './Hardware';
import SignalTrace from './SignalTrace';
import type {SceneProps} from './types';

export default function ExperienceScene({reducedMotion,tier}:SceneProps) {
 useSceneCamera('floorplan');const materials=useRef<(MeshStandardMaterial|null)[]>([]),time=useRef(0);
 useFrame((_,delta)=>{if(!reducedMotion)time.current+=Math.min(delta,.05);const stage=reducedMotion?3:Math.floor(time.current*.6)%4;materials.current.forEach((m,i)=>{if(m)m.emissiveIntensity=i===stage?1.1:.25;});});
 return <group rotation={[0,-.2,0]}>
  <group position={[0,-.14,0]}><SystemBed width={6.5} depth={4.4} tier={tier} reducedMotion={reducedMotion}/></group>
  {[-1.95,-.65,.65,1.95].map((x,i)=><group key={x} position={[x,.08,0]}>
   <Plate width={1.14} depth={1.52} height={.14} color='#454c4f' rim bolts/>
   <group position={[0,.1,0]}><CircuitBoard width={1.05} depth={1.42} tier={tier} seed={100+i}/></group>
   <group position={[0,.7,-.04]}><Plate width={1.04} depth={.95} height={.09} color='#656e72' rim bolts/><group position={[0,.12,0]}><Processor width={.45}/></group></group>
   <Parts parts={[-1,1].flatMap(a=>[-1,1].map(b=>({position:[a*.46,.42,b*.39-.04] as [number,number,number],size:[.065,.58,.065] as [number,number,number]})))} color='#a3a9a6'/>
   <mesh position={[0,.41,.36]}><boxGeometry args={[.88,.47,.045]}/><meshStandardMaterial color='#121a1d' metalness={.6} roughness={.28}/></mesh>
   <mesh position={[0,.42,.389]}><planeGeometry args={[.78,.37]}/><meshStandardMaterial ref={m=>{materials.current[i]=m;}} color='#69411d' emissive={AMBER} emissiveIntensity={.35} metalness={.4} roughness={.18}/></mesh>
   <Label text={['SPEC','RTL','TESTBENCH','VERIFY'][i]} color='#1b1005' position={[0,.43,.393]} rotation={[0,0,0]} width={.76}/>
   <group position={[0,.16,.67]}><Connector width={.75} count={10}/></group>
   <SignalTrace strength={1.2} reducedMotion={reducedMotion} offset={i*.17} points={[[-.46,.14,.59],[-.46,.14,-.54],[-.46,.7,-.54],[.46,.7,-.54],[.46,.14,-.54],[.46,.14,.59]]}/>
  </group>)}
  {[0,1,2].flatMap(n=>[-1.95,-.65,.65].map((x,i)=><SignalTrace key={`${n}-${i}`} strength={n===1?1.5:.7} reducedMotion={reducedMotion} offset={i*.2+n*.2} points={[[x,.06,1+n*.17],[x+.4,.06,1+n*.17],[x+.4,.06,.86],[x+.9,.06,.86],[x+.9,.06,1+n*.17],[x+1.3,.06,1+n*.17]]}/>))}
  <pointLight position={[0,.35,1]} color='#ff9c23' intensity={4} distance={5} decay={2}/>
 </group>;
}
