import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line,RoundedBox} from '@react-three/drei';
import {Group,MathUtils,PointLight} from 'three';
import {CircuitBoard,Processor,Connector,SystemBed,Parts} from './Circuitry';
import {Plate,Bolt,AMBER,Label} from './Hardware';
import SignalTrace from './SignalTrace';
import EnergyRibbon from './EnergyRibbon';
import {Frame,PowerBank,SiliconDie} from './ModuleHardware';
import type {SceneProps} from './types';

export default function ChipLayers({progress,active,reducedMotion,tier,pointer}:SceneProps&{progress:React.RefObject<number>;active:number;pointer?:React.RefObject<{x:number;y:number}>}) {
 const layers=useRef<(Group|null)[]>([]),clock=useRef(0),core=useRef<PointLight>(null);
 useFrame((_,delta)=>{const dt=Math.min(delta,.05);if(!reducedMotion)clock.current+=dt;
  const split=reducedMotion?0:MathUtils.smoothstep(progress.current,.15,.92);
  layers.current.forEach((g,i)=>{if(g){g.position.y=MathUtils.damp(g.position.y,-.7+i*.47+i*split*.25+(reducedMotion?0:Math.sin(clock.current*.25+i)*.006),4,dt);g.position.x=MathUtils.damp(g.position.x,active===i?split*.09:0,4,dt);}});
  if(core.current)core.current.intensity=5.3+(reducedMotion?0:Math.sin(clock.current*1.25)*.6+Math.max(0,-(pointer?.current.y||0))*1.1);
 });
 const columns=Array.from({length:12},(_,i)=>({position:[i%2?1.33:-1.33,-.16,-1+(Math.floor(i/2))*.4] as [number,number,number],size:[.055,.49,.055] as [number,number,number]}));
 return <group>
  <group position={[0,-1.12,-.2]}><SystemBed reducedMotion={reducedMotion} tier={tier} width={9.4} depth={7.2}/></group>
  <group position={[0,-.83,0]}><Plate width={4.7} depth={3.7} height={.25} color='#242a2d' rim bolts/></group>
  <group position={[0,-.56,-2.48]} rotation={[Math.PI/3,0,0]}><CircuitBoard width={5.2} depth={.94} tier={tier} seed={148}/>{[-1.8,-.6,.6,1.8].map(x=><group key={x} position={[x,.09,0]}><Processor width={.38} active={false}/></group>)}<SignalTrace reducedMotion={reducedMotion} strength={.8} points={[[-2.4,.15,.34],[2.4,.15,.34]]}/></group>
  {[-1,1].map(side=><group key={side} position={[side*1.91,-.63,-.12]}><CircuitBoard width={.62} depth={2.62} tier={tier} seed={23+side}/><Parts parts={Array.from({length:6},(_,n)=>({position:[0,.13,(n-2.5)*.35],size:[.42,.16,.23]}))} color='#232a2b'/><group position={[0,.19,1.08]}><Connector width={.5} count={7}/></group></group>)}
  {[0,1,2].map(i=><group key={i} ref={g=>{layers.current[i]=g;}} position={[0,-.7+i*.47,0]}>
   <CircuitBoard width={3.35-i*.32} depth={2.7-i*.25} tier={tier} seed={i+3}/>
   <Frame width={3.35-i*.32} depth={2.7-i*.25} height={.19}/>
   <group position={[0,.065,0]}><Processor width={1.33-i*.14} active/></group>
   <Parts parts={columns} color='#9aa1a1' metalness={.95} roughness={.29}/>
   {[-1,1].map(s=><group key={s} position={[s*(1.23-i*.14),.22,.07]}><PowerBank count={7}/></group>)}
   {[-1,1].map(side=><group key={side} position={[side*(1.44-i*.14),.2,-.04]}><Parts parts={Array.from({length:8},(_,n)=>({position:[0,0,(n-3.5)*.2],size:[.24,.29,.17]}))} color='#151e22' metalness={.22} roughness={.53}/></group>)}
   <Label text={['HARDWARE / IO','RTL / VERIFY','COMPUTE / AUTOMATION'][i]} position={[0,.066,1.17-i*.13]} width={.85} color='#b7bdb7'/>
   {[-1,1].flatMap(side=>[0,1].map(n=><SignalTrace key={`${side}-${n}`} strength={1.45} reducedMotion={reducedMotion} offset={i*.17+n*.28} points={[[side*(1.58-i*.16),.215,-.84+n*.16],[side*.82,.215,-.84+n*.16],[side*.82,.215,-.36+n*.13],[side*.58,.24,-.36+n*.13],[side*.58,.31,.45-n*.2],[side*(1.52-i*.14),.215,.73-n*.17]]}/>))}
   <mesh position={[0,.11,1.363-i*.125]}><boxGeometry args={[2.82-i*.32,.018,.018]}/><meshStandardMaterial color={AMBER} emissive='#ff9b29' emissiveIntensity={3.6} toneMapped={false}/></mesh>
   {[-1,1].map(s=><SignalTrace key={s} strength={.95} reducedMotion={reducedMotion} offset={i*.2} points={[[s*(1.62-i*.16),-.14,1.363-i*.125],[s*(1.62-i*.16),.11,1.363-i*.125],[s*(1.62-i*.16),.215,1.11-i*.12],[s*.7,.215,1.11-i*.12],[s*.7,.3,.65]]}/>)}
  </group>)}
  <group ref={g=>{layers.current[3]=g;}} position={[0,.71,0]}>
   <Plate width={2.53} depth={2.1} height={.085} color='#687980' rim bolts/>
   <group position={[0,.08,0]}><CircuitBoard width={2.4} depth={1.97} tier={tier} seed={8} base={false}/><Processor width={.85}/>
    {[-1,1].map(side=><group key={side} position={[side*.83,.11,0]}><Parts parts={Array.from({length:4},(_,n)=>({position:[0,0,(n-1.5)*.28],size:[.27,.13,.19]}))} color='#171e20'/></group>)}
    <group position={[0,.325,0]}><SiliconDie width={.59}/></group>
   </group>
   {[-1,1].map(side=><SignalTrace key={side} strength={1.1} reducedMotion={reducedMotion} offset={(side+1)*.22} points={[[side*1.12,.225,-.84],[side*.56,.225,-.84],[side*.56,.28,-.44],[0,.28,-.44],[0,.225,.76],[side*1.12,.225,.76]]}/>)}
  </group>
  <group ref={g=>{layers.current[4]=g;}} position={[0,1.18,0]}>
   <RoundedBox args={[2.55,.025,2.15]} radius={.022} smoothness={1}><meshPhysicalMaterial color='#77929a' metalness={.15} roughness={.13} transparent opacity={.045} depthWrite={false}/></RoundedBox>
   <Line points={[[-1.28,.02,-1.08],[1.28,.02,-1.08],[1.28,.02,1.08],[-1.28,.02,1.08],[-1.28,.02,-1.08]]} color='#d7dde0' lineWidth={.65} transparent opacity={.6} raycast={()=>{}}/>
   {[-1,1].flatMap(x=>[-1,1].map(z=><Bolt key={`${x}-${z}`} position={[x*1.13,.028,z*.93]}/>))}
  </group>
  {[-1,1].flatMap(side=>[0,1,2].map(n=><SignalTrace key={`${side}-${n}`} reducedMotion={reducedMotion} strength={1.15} offset={n*.27+(side+1)*.14} points={[[side*3.25,-.98,-1.6+n*.23],[side*(1.72+n*.13),-.98,-1.6+n*.23],[side*(1.72+n*.13),-.56,-1.18],[side*1.14,-.56,-1.18],[side*1.14,.73,-1.18],[side*.25,.73,-1.18]]}/>))}
  {[0,1].map(n=><EnergyRibbon key={n} reducedMotion={reducedMotion} spill={n===0?1.2:0} offset={n*.4} points={[[4.5,-1.03,1.9],[3.6,-1.03,1.9],[2.7,-1.03,.8],[2.35,-.76,-.2],[1.92,-.68,-1.35],[1.58,-.3,-1.22],[1.43,.22,-1.1],[1.15,.78,-.88],[.42,.84,-.82],[.23,1.02,-.2]].map(([x,y,z])=>[x,y,z+n*.08] as [number,number,number])}/>)}
  {[0,1].map(n=><EnergyRibbon key={`feed-${n}`} reducedMotion={reducedMotion} spill={n===0?.8:0} offset={n*.35} points={[[-4.5,-1.02,1.65],[-3.55,-1.02,1.65],[-2.9,-1.02,2.1],[-1.1,-1.02,2.42],[1.1,-1.02,2.4],[2.65,-1.02,1.8],[2.4,-.7,.85],[1.9,-.65,.75]].map(([x,y,z])=>[x,y,z+n*.09] as [number,number,number])}/>)}
  {[-1,1].map(s=><group key={s} position={[s*2.28,-.54,-.32]}><Frame width={.36} depth={2.75} height={.3}/><Parts parts={Array.from({length:12},(_,n)=>({position:[0,.26,(n-5.5)*.2] as [number,number,number],size:[.24,.17,.09] as [number,number,number]}))} color='#738188' roughness={.27}/></group>)}
  <pointLight ref={core} position={[0,.15,.65]} color='#ffa939' intensity={3} distance={3} decay={2}/>
  <SignalTrace spill={1.2} speed={.09} reducedMotion={reducedMotion} strength={.85} points={[[-4.4,-1.03,.8],[-2.3,-1.03,.8],[-2.3,-.65,.8],[-1.5,-.65,.8],[-1.5,-.15,.8],[-1.05,-.15,.8],[-1.05,.74,.8],[0,.74,.8],[0,1.02,0],[.3,1.02,0]]}/>
  <SignalTrace reducedMotion={reducedMotion} strength={.7} points={[[0,2,-.3],[0,1.04,-.3],[.7,1.04,-.3],[.7,.5,-.3],[.7,.5,.7],[.7,-.75,.7],[4.5,-1.03,.7]]}/>
 </group>;
}
