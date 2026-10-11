import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line,RoundedBox} from '@react-three/drei';
import {Group,MathUtils} from 'three';
import {CircuitBoard,Processor,Connector,SystemBed,Parts} from './Circuitry';
import {Plate,Bolt,AMBER,Label} from './Hardware';
import SignalTrace from './SignalTrace';
import EnergyRibbon from './EnergyRibbon';
import type {SceneProps} from './types';

export default function ChipLayers({progress,active,reducedMotion,tier}:SceneProps&{progress:React.RefObject<number>;active:number}) {
 const layers=useRef<(Group|null)[]>([]),clock=useRef(0);
 useFrame((_,delta)=>{const dt=Math.min(delta,.05);if(!reducedMotion)clock.current+=dt;
  const split=reducedMotion?0:MathUtils.smoothstep(progress.current,.15,.92);
  layers.current.forEach((g,i)=>{if(g){g.position.y=MathUtils.damp(g.position.y,-.7+i*.47+i*split*.25+(reducedMotion?0:Math.sin(clock.current*.25+i)*.006),4,dt);g.position.x=MathUtils.damp(g.position.x,active===i?split*.09:0,4,dt);}});
 });
 const columns=Array.from({length:12},(_,i)=>({position:[i%2?1.33:-1.33,-.16,-1+(Math.floor(i/2))*.4] as [number,number,number],size:[.055,.49,.055] as [number,number,number]}));
 return <group>
  <group position={[0,-1.06,0]}><SystemBed reducedMotion={reducedMotion} tier={tier} width={7.4} depth={5.8}/></group>
  <group position={[0,-.83,0]}><Plate width={4.7} depth={3.7} height={.25} color='#242a2d' rim bolts/></group>
  {[-1,1].map(side=><group key={side} position={[side*1.91,-.63,-.12]}><CircuitBoard width={.62} depth={2.62} tier={tier} seed={23+side}/><Parts parts={Array.from({length:6},(_,n)=>({position:[0,.13,(n-2.5)*.35],size:[.42,.16,.23]}))} color='#232a2b'/><group position={[0,.19,1.08]}><Connector width={.5} count={7}/></group></group>)}
  {[0,1,2].map(i=><group key={i} ref={g=>{layers.current[i]=g;}} position={[0,-.7+i*.47,0]}>
   <CircuitBoard width={3.35-i*.32} depth={2.7-i*.25} tier={tier} seed={i+3}/>
   <group position={[0,.065,0]}><Processor width={1.33-i*.14} active/></group>
   <Parts parts={columns} color='#9aa1a1' metalness={.95} roughness={.29}/>
   {[-1,1].map(side=><group key={side} position={[side*(1.44-i*.14),.2,-.04]}><Parts parts={Array.from({length:8},(_,n)=>({position:[0,0,(n-3.5)*.2],size:[.24,.29,.17]}))} color='#151e22' metalness={.22} roughness={.53}/></group>)}
   <Label text={['HARDWARE / IO','RTL / VERIFY','COMPUTE / AUTOMATION'][i]} position={[0,.066,1.17-i*.13]} width={.85} color='#b7bdb7'/>
   {[-1,1].flatMap(side=>[0,1].map(n=><SignalTrace key={`${side}-${n}`} strength={1.4} reducedMotion={reducedMotion} offset={i*.17+n*.28} points={[[side*(1.58-i*.16),.072,-.84+n*.16],[side*.82,.072,-.84+n*.16],[side*.82,.072,-.36+n*.13],[side*.58,.2,-.36+n*.13],[side*.58,.28,.45-n*.2],[side*(1.52-i*.14),.072,.73-n*.17]]}/>))}
   <mesh position={[0,.015,1.32-i*.12]}><boxGeometry args={[2.35-i*.3,.025,.026]}/><meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={3} toneMapped={false}/></mesh>
  </group>)}
  <group ref={g=>{layers.current[3]=g;}} position={[0,.71,0]}>
   <Plate width={2.53} depth={2.1} height={.085} color='#515b61' rim bolts/>
   <group position={[0,.08,0]}><CircuitBoard width={2.4} depth={1.97} tier={tier} seed={8} base={false}/><Processor width={.85}/>
    {[-1,1].map(side=><group key={side} position={[side*.83,.11,0]}><Parts parts={Array.from({length:4},(_,n)=>({position:[0,0,(n-1.5)*.28],size:[.27,.13,.19]}))} color='#171e20'/></group>)}
   </group>
   {[-1,1].map(side=><SignalTrace key={side} strength={1.1} reducedMotion={reducedMotion} offset={(side+1)*.22} points={[[side*1.12,.06,-.84],[side*.56,.06,-.84],[side*.56,.13,-.44],[0,.14,-.44],[0,.14,.76],[side*1.12,.06,.76]]}/>)}
  </group>
  <group ref={g=>{layers.current[4]=g;}} position={[0,1.18,0]}>
   <RoundedBox args={[2.55,.025,2.15]} radius={.022} smoothness={1}><meshPhysicalMaterial color='#77929a' metalness={.15} roughness={.13} transparent opacity={.045} depthWrite={false}/></RoundedBox>
   <Line points={[[-1.28,.02,-1.08],[1.28,.02,-1.08],[1.28,.02,1.08],[-1.28,.02,1.08],[-1.28,.02,-1.08]]} color='#d7dde0' lineWidth={.65} transparent opacity={.6} raycast={()=>{}}/>
   {[-1,1].flatMap(x=>[-1,1].map(z=><Bolt key={`${x}-${z}`} position={[x*1.13,.028,z*.93]}/>))}
  </group>
  {[-1,1].flatMap(side=>[0,1,2].map(n=><SignalTrace key={`${side}-${n}`} reducedMotion={reducedMotion} strength={1.15} offset={n*.27+(side+1)*.14} points={[[side*3.25,-.98,-1.6+n*.23],[side*(1.72+n*.13),-.98,-1.6+n*.23],[side*(1.72+n*.13),-.56,-1.18],[side*1.14,-.56,-1.18],[side*1.14,.73,-1.18],[side*.25,.73,-1.18]]}/>))}
  {[0,1,2].map(n=><EnergyRibbon key={n} reducedMotion={reducedMotion} offset={n*.29} points={[[3.6,-.9,1.75],[2.8,-.86,.65],[1.95,-.5,-.5],[2.4,.2,-1.6],[1.4,.45,-2.15],[-.5,.55,-2.13],[-2.6,-.05,-1.6],[-2.75,-.4,.1],[-1.7,-.35,1.55],[.3,-.4,1.9],[1.6,.05,1.5],[.3,.67,.73]].map(([x,y,z])=>[x,y+n*.06,z+n*.12] as [number,number,number])}/>)}
  <pointLight position={[0,.15,.65]} color='#ffa522' intensity={4} distance={3} decay={2}/>
  <pointLight position={[-1.8,-.4,-.7]} color='#ff9818' intensity={3} distance={2.5} decay={2}/>
  <SignalTrace reducedMotion={reducedMotion} strength={.7} points={[[0,2.5,-.3],[0,1.04,-.3],[.7,1.04,-.3],[.7,.5,-.3],[.7,.5,.7],[.7,-.75,.7],[2.8,-.75,.7]]}/>
 </group>;
}
