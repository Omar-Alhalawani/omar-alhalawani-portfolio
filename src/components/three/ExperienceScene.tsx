import {useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {MeshStandardMaterial,MathUtils} from 'three';
import {useSceneCamera} from './useSceneData';
import {CircuitBoard,Processor,Connector,SystemBed,Parts} from './Circuitry';
import {Plate,Label,AMBER,READ} from './Hardware';
import {Frame,PowerBank,SiliconDie} from './ModuleHardware';
import Waveform from './Waveform';
import SignalTrace from './SignalTrace';
import {PortBank,PowerShelf} from './EngineeringDetails';
import {useMicroSequence,useSectionActivation} from './useMicroSequence';
import type {SceneProps} from './types';

export default function ExperienceScene({reducedMotion,tier}:SceneProps) {
 const activation=useSectionActivation('experience'),sequence=useMicroSequence(activation,reducedMotion,5,4.8,'verification');
 useSceneCamera('floorplan');const materials=useRef<(MeshStandardMaterial|null)[]>([]),pass=useRef<MeshStandardMaterial>(null),time=useRef(0),phase=useRef(.9);
 const [lit,setLit]=useState([false,false,false,false]),litState=useRef(lit);
 const activity=useRef([{current:.5},{current:0},{current:0},{current:0}]);
 useFrame((_,delta)=>{
  if(!reducedMotion)time.current+=Math.min(delta,.1);
  phase.current=reducedMotion?.85:sequence.progress.current;
  const windows=[[0,.19],[.19,.39],[.39,.68],[.68,.91]];
  materials.current.forEach((m,i)=>{const [a,b]=windows[i],p=phase.current;const value=reducedMotion?.55:p>=a&&p<b?MathUtils.smoothstep(p,a,a+.025)*(1-MathUtils.smoothstep(p,b-.025,b)):0;activity.current[i].current=value;if(m)m.emissiveIntensity=.035+value*.7;});
  const next=activity.current.map(a=>a.current>.12);
  if(next.some((on,i)=>on!==litState.current[i])){litState.current=next;setLit(next);}
  if(pass.current)pass.current.emissiveIntensity=reducedMotion||phase.current>.77&&phase.current<.98?.85:.035;
  const sample=window.__PORTFOLIO_PROFILE__?.scenes.verification;if(sample)sample.pose=[phase.current,sequence.stage];
 });
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
   {i===0&&<group position={[0,.92,-.08]} rotation={[-.42,0,0]}>
    <mesh><boxGeometry args={[.86,.58,.055]}/><meshStandardMaterial color='#697b84' metalness={.9} roughness={.26}/></mesh>
    <Parts parts={[{position:[0,0,.033],size:[.76,.5,.012]}]} color='#a5b2aa' metalness={.06} roughness={.72}/>
    <Parts parts={Array.from({length:6},(_,n)=>({position:[n%2?.06:0,.12-n*.055,.041] as [number,number,number],size:[n%2?.5:.62,.013,.004] as [number,number,number]}))} color='#3b555a' metalness={0}/>
    <Label text='INTERFACE / RULES' position={[0,.205,.043]} rotation={[0,0,0]} width={.68} color='#243f48'/>
   </group>}
   {i===1&&<group position={[0,.72,-.03]}><Processor width={.67} active={false}/><group position={[0,.276,0]}><SiliconDie width={.4}/></group><Label text='LOGIC / RTL' position={[0,.275,.38]} width={.8}/></group>}
   {i===2&&<>
    <group position={[-.25,.73,-.25]}><Processor width={.29} active={false}/></group><group position={[.25,.73,-.25]}><Processor width={.29} active={false}/></group>
    <group position={[0,.81,.29]} rotation={[-Math.PI/2,0,0]}><Waveform position={[0,.1,0]} width={.84} amplitude={.035} noisy color={READ} reducedMotion={reducedMotion} active={sequence.running&&sequence.stage===2}/><Waveform position={[0,-.07,0]} width={.84} amplitude={.035} reducedMotion={reducedMotion} active={sequence.running&&sequence.stage===2}/></group>
    <Label text='STIM / MONITOR' position={[0,1.015,-.27]} width={.86} color={READ}/>
    <group position={[0,.14,-.76]}><Connector width={.87} count={10}/></group>
   </>}
   {i===3&&<>
    <group position={[0,.77,-.17]}><Plate width={.92} depth={.87} height={.12} color='#38525d'/><Parts parts={Array.from({length:4},(_,n)=>({position:[.09,.07,(n-1.5)*.15] as [number,number,number],size:[.5,.015,.038] as [number,number,number]}))} color='#a0b4b8' roughness={.5}/><Parts parts={Array.from({length:4},(_,n)=>({position:[-.31,.071,(n-1.5)*.15] as [number,number,number],size:[.065,.02,.065] as [number,number,number]}))} color='#99b88d' metalness={.05}/><Label text='CHECKER / RESULTS' position={[0,.076,-.35]} width={.86}/></group>
    <mesh position={[0,.82,.42]}><boxGeometry args={[.53,.08,.12]}/><meshStandardMaterial ref={pass} color='#c9a457' emissive={AMBER} emissiveIntensity={.1} roughness={.24}/></mesh><Label text='PASS' position={[0,.866,.42]} width={.43} color='#231b0c'/>
   </>}
   <group position={[-.48,.35,-.02]}><PowerBank count={4}/></group>
   <mesh position={[0,.37,.63]}><boxGeometry args={[1.03,.45,.045]}/><meshStandardMaterial color='#12232b' metalness={.7} roughness={.23}/></mesh>
   <mesh position={[0,.37,.657]}><planeGeometry args={[.96,.36]}/><meshStandardMaterial ref={m=>{materials.current[i]=m;}} color='#233238' emissive={AMBER} emissiveIntensity={.15} metalness={.55} roughness={.24}/></mesh>
   <Label text={['SPEC','RTL','TESTBENCH','VERIFY'][i]} color={lit[i]?'#101719':'#e4dfce'} position={[0,.37,.66]} rotation={[0,0,0]} width={.9}/>
   <group position={[0,.15,.81]}><Connector width={.84}/></group>
   <SignalTrace strength={1.05} reducedMotion={reducedMotion} activityRef={activity.current[i]} speed={.18} offset={i*.25} points={[[0,.23,.84],[-.53,.23,.84],[-.53,.23,-.5],[-.53,.69,-.5],[0,.69,-.5],[0,.76,0]]}/>
   <mesh position={[0,.12,.91]}><boxGeometry args={[1.1,.018,.014]}/><meshStandardMaterial color={AMBER} emissive='#ffac40' emissiveIntensity={.35}/></mesh>
  </group>)}
  {[0,1,2].map(n=><SignalTrace key={n} spill={n===1?.75:0} active={sequence.running} strength={n===1?1.3:.75} reducedMotion={reducedMotion} duty={.45} period={24} progressRef={phase} offset={.08+n*.12} points={[[-2.65,.14,1.1+n*.11],[-2.05,.14,1.1+n*.11],[-2.05,.14,.94],[-.68,.14,.94],[-.68,.14,1.1+n*.11],[.68,.14,1.1+n*.11],[.68,.14,.94],[2.05,.14,.94],[2.05,.14,1.1+n*.11],[2.6,.14,1.1+n*.11]]}/>)}
 </group>;
}
