import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {MeshStandardMaterial} from 'three';
import {useSceneCamera} from './useSceneData';
import {CircuitBoard,Processor,Connector,SystemBed,Parts} from './Circuitry';
import {Plate,Label,AMBER,READ} from './Hardware';
import {Frame,PowerBank,SiliconDie} from './ModuleHardware';
import Waveform from './Waveform';
import SignalTrace from './SignalTrace';
import {PortBank,PowerShelf} from './EngineeringDetails';
import type {SceneProps} from './types';

export default function ExperienceScene({reducedMotion,tier}:SceneProps) {
 useSceneCamera('floorplan');const materials=useRef<(MeshStandardMaterial|null)[]>([]),pass=useRef<MeshStandardMaterial>(null),time=useRef(0),phase=useRef(.9);
 useFrame((_,delta)=>{if(!reducedMotion)time.current+=Math.min(delta,.05);phase.current=reducedMotion?.9:(time.current*.075)%1;const stage=Math.min(3,Math.floor(phase.current*4));materials.current.forEach((m,i)=>{if(m)m.emissiveIntensity=i===stage?.8:.04;});if(pass.current)pass.current.emissiveIntensity=phase.current>.82?1.7:.05;});
 return <group rotation={[0,-.2,0]}>
  <group position={[0,-.25,0]}><SystemBed width={7.2} depth={4.5} tier={tier} reducedMotion={reducedMotion}/></group>
  <group position={[0,-.05,0]}><CircuitBoard width={5.7} depth={2.95} tier={tier} seed={107} components={false}/><Frame width={5.7} depth={2.95} height={.16}/></group>
  <group position={[0,.02,-1.72]}><PowerShelf tier={tier} scale={1.15}/></group>
  <group position={[0,-.04,1.69]}><PortBank width={5.5} count={8}/></group>
  <Parts parts={[-1,1].map(s=>({position:[0,.12,s*1.38] as [number,number,number],size:[5.7,.1,.085] as [number,number,number]}))} color='#6b818c' metalness={.9} roughness={.3}/>
  {[-2.05,-.68,.68,2.05].map((x,i)=><group key={x} position={[x,.09,0]}>
   <Plate width={1.22} depth={1.8} height={.13} color='#687a80' rim bolts/>
   <group position={[0,.09,0]}><CircuitBoard width={1.12} depth={1.68} tier={tier} seed={100+i}/><Frame width={1.1} depth={1.6} height={.17}/></group>
   <Parts parts={[-1,1].flatMap(a=>[-1,1].map(b=>({position:[a*.47,.35,b*.55] as [number,number,number],size:[.055,.57,.055] as [number,number,number]})))} color='#a3b2b8'/>
   <group position={[0,.64,0]}><Plate width={1.08} depth={1.35} height={.09} color='#3b4b53' rim bolts/></group>
   {i===0&&<group position={[0,.7,-.03]}><SiliconDie width={.75}/><mesh position={[0,.11,0]}><boxGeometry args={[.87,.025,.98]}/><meshPhysicalMaterial color='#a4c1ce' metalness={.1} roughness={.09} transparent opacity={.14} depthWrite={false}/></mesh></group>}
   {i===1&&<group position={[0,.72,-.03]}><Processor width={.67}/></group>}
   {i===2&&<><group position={[-.25,.73,-.1]}><Processor width={.32}/></group><group position={[.25,.73,-.1]}><Processor width={.32}/></group><group position={[0,.78,.35]} rotation={[-Math.PI/2,0,0]}><Waveform width={.86} amplitude={.1} color={READ} reducedMotion={reducedMotion}/></group></>}
   {i===3&&<><group position={[0,.73,-.15]}><Processor width={.62}/></group><mesh position={[0,.82,.42]}><boxGeometry args={[.53,.08,.12]}/><meshStandardMaterial ref={pass} color='#c9a457' emissive={AMBER} emissiveIntensity={.1} roughness={.24}/></mesh><Label text='PASS' position={[0,.866,.42]} width={.43} color='#231b0c'/></>}
   <group position={[-.48,.35,-.02]}><PowerBank count={4}/></group>
   <mesh position={[0,.37,.63]}><boxGeometry args={[1.03,.45,.045]}/><meshStandardMaterial color='#12232b' metalness={.7} roughness={.23}/></mesh>
   <mesh position={[0,.37,.657]}><planeGeometry args={[.96,.36]}/><meshStandardMaterial ref={m=>{materials.current[i]=m;}} color='#233238' emissive={AMBER} emissiveIntensity={.15} metalness={.55} roughness={.24}/></mesh>
   <Label text={['SPEC','RTL','TESTBENCH','VERIFY'][i]} color='#e4dfce' position={[0,.37,.66]} rotation={[0,0,0]} width={.9}/>
   <group position={[0,.15,.81]}><Connector width={.84}/></group>
   <SignalTrace strength={1.05} reducedMotion={reducedMotion} progressRef={phase} offset={i*.25} points={[[0,.23,.84],[-.53,.23,.84],[-.53,.23,-.5],[-.53,.69,-.5],[0,.69,-.5],[0,.76,0]]}/>
   <mesh position={[0,.12,.91]}><boxGeometry args={[1.1,.018,.014]}/><meshStandardMaterial color={AMBER} emissive='#ffac40' emissiveIntensity={2.6}/></mesh>
  </group>)}
  {[0,1,2].map(n=><SignalTrace key={n} spill={n===1?3.2:0} strength={n===1?1.3:.75} reducedMotion={reducedMotion} progressRef={phase} offset={n*.014} points={[[-2.65,.14,1.1+n*.11],[-2.05,.14,1.1+n*.11],[-2.05,.14,.94],[-.68,.14,.94],[-.68,.14,1.1+n*.11],[.68,.14,1.1+n*.11],[.68,.14,.94],[2.05,.14,.94],[2.05,.14,1.1+n*.11],[2.6,.14,1.1+n*.11]]}/>)}
 </group>;
}
