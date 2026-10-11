import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,MathUtils,PointLight} from 'three';
import {CircuitBoard,SystemBed,Parts,Connector} from './Circuitry';
import {Plate,AMBER,Label} from './Hardware';
import SignalTrace from './SignalTrace';
import {Frame,PowerBank} from './ModuleHardware';
import {ComputePackage,PortBank,PowerShelf,SideCar} from './EngineeringDetails';
import type {SceneProps} from './types';

// Three serviceable assemblies: I/O backplane, compute board, semiconductor socket.
export default function ChipLayers({progress,active,reducedMotion,tier,pointer}:SceneProps&{progress:React.RefObject<number>;active:number;pointer?:React.RefObject<{x:number;y:number}>}) {
 const layers=useRef<(Group|null)[]>([]),clock=useRef(0),core=useRef<PointLight>(null);
 useFrame((_,delta)=>{const dt=Math.min(delta,.05);if(!reducedMotion)clock.current+=dt;const split=reducedMotion?0:MathUtils.smoothstep(progress.current,.15,.92);layers.current.forEach((g,i)=>{if(g)g.position.y=MathUtils.damp(g.position.y,[-.63,-.13,.35][i]+i*split*.23+(reducedMotion?0:Math.sin(clock.current*.2+i)*.004),4,dt);});if(core.current)core.current.intensity=3.6+(reducedMotion?0:Math.sin(clock.current*.91)*.45+Math.max(0,1-Math.hypot(pointer?.current.x||0,pointer?.current.y||0))*.9);});
 return <group>
  <group position={[0,-1.05,-.3]}><SystemBed width={9.4} depth={7.2} tier={tier} reducedMotion={reducedMotion}/></group>
  <group position={[0,-.83,0]}><Plate width={5.6} depth={4.15} height={.2} color='#1c2429' rim bolts/><Frame width={5.6} depth={4.15} height={.3}/></group>
  <group position={[0,-.63,-2.1]} rotation={[Math.PI/3.5,0,0]}><PowerShelf tier={tier}/><SignalTrace reducedMotion={reducedMotion} points={[[-2.12,.13,.35],[0,.13,.35],[2.12,.13,.35]]} strength={.8}/></group>
  {[-1,1].map(s=><group key={s} position={[s*2.33,-.54,-.03]}><SideCar tier={tier}/></group>)}
  <group ref={g=>{layers.current[0]=g;}} position={[0,-.63,0]}>
   <CircuitBoard width={4.78} depth={3.42} tier={tier} seed={183}/>
   <group position={[0,.13,1.55]}><PortBank width={4.45} count={6}/></group>
   <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*2.08,.32,z*1.35] as [number,number,number],size:[.1,.65,.1] as [number,number,number]})))} color='#8b979b' roughness={.25}/>
   <Label text='SYSTEM BACKPLANE / SIGNAL IO' position={[0,.075,1.08]} width={2.2}/>
   {[-1,1].map(s=><SignalTrace key={s} reducedMotion={reducedMotion} strength={1.1} offset={(s+1)*.18} points={[[s*2.24,.073,1.03],[s*1.4,.073,1.03],[s*1.4,.073,-1.16],[s*.2,.073,-1.16]]}/>)}
  </group>
  <group ref={g=>{layers.current[1]=g;}} position={[0,-.13,-.12]}>
   <CircuitBoard width={4.26} depth={3.15} tier={tier} seed={184}/><Frame width={4.26} depth={3.15} height={.14}/>
   <group position={[0,.11,-1.28]}><PowerShelf tier={tier} scale={.8}/></group>
   {[-1,1].map(s=><group key={s} position={[s*1.85,.18,.08]}><PowerBank count={tier==='low'?5:10}/></group>)}
   <Parts parts={[-1,1].flatMap(s=>Array.from({length:8},(_,n)=>({position:[s*1.49,.16,(n-3.5)*.27] as [number,number,number],size:[.24,.17,.17] as [number,number,number]})))} color='#25363a' metalness={.16} roughness={.62}/>
   {[-1,1].flatMap(s=>Array.from({length:tier==='high'?5:3},(_,n)=><SignalTrace key={`${s}-${n}`} reducedMotion={reducedMotion} speed={.1+n*.014} offset={n*.17+(s+1)*.1} strength={.7} spill={n===1&&s===1?.6:0} points={[[s*2.03,.083,.83-n*.36],[s*1.18,.083,.83-n*.36],[s*1.18,.083,.56-n*.25],[s*.74,.083,.56-n*.25],[s*.74,.19,.15]]}/>))}
   <group position={[0,.11,1.38]}><Connector width={2.7} count={24}/></group>
  </group>
  <group ref={g=>{layers.current[2]=g;}} position={[0,.35,-.12]}>
   <ComputePackage tier={tier}/>
   {[-1,1].map(s=><SignalTrace key={s} reducedMotion={reducedMotion} spill={s===1?1.1:0} strength={1.0} offset={(s+1)*.2} points={[[s*1.4,.07,1.14],[s*.75,.07,1.14],[s*.75,.14,.75],[s*.56,.28,.75],[s*.56,.294,.35],[s*.23,.294,.35]]}/>)}
   <mesh position={[0,.065,1.26]}><boxGeometry args={[2.75,.014,.018]}/><meshStandardMaterial color={AMBER} emissive='#ff9b29' emissiveIntensity={3}/></mesh>
  </group>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:tier==='low'?9:20},(_,i)=>({position:[s*2.77,-.39,(i-(tier==='low'?8:19)/2)*.14] as [number,number,number],size:[.28,.39,.045] as [number,number,number]})))} color='#687981' metalness={.95} roughness={.26}/>
  {[-1,1].map(s=><SignalTrace key={`vertical-${s}`} reducedMotion={reducedMotion} spill={s===1?1.2:0} strength={1.1} offset={(s+1)*.19} points={[[s*4.65,-.97,1.65],[s*3.2,-.97,1.65],[s*3.2,-.97,.74],[s*2.15,-.97,.74],[s*2.15,-.63,.74],[s*1.94,-.63,.74],[s*1.94,-.13,.74],[s*1.4,-.13,.74],[s*1.4,.27,.74],[s*.7,.27,.74]]}/>)}
  {[-1,1].map(s=><SignalTrace key={`rear-${s}`} reducedMotion={reducedMotion} strength={.8} speed={.08} points={[[s*.25,.286,-.47],[s*.86,.286,-.47],[s*.86,.07,-1.2],[s*1.5,.07,-1.2],[s*1.5,-.9,-1.7],[s*4.6,-.9,-1.7]]}/>)}
  <pointLight ref={core} position={[0,.17,.44]} color='#ff9c2b' intensity={3.6} distance={3} decay={2}/>
  <pointLight position={[-2.35,-.35,.76]} color='#ffc06b' intensity={1.5} distance={2.2} decay={2}/>
  <Label text={`ASSEMBLY / ${active+1}`} position={[0,-.71,2.05]} width={1.4} color='#9faaa9'/>
 </group>;
}
