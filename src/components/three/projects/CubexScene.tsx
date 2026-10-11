import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group} from 'three';
import {Line} from '@react-three/drei';
import {Board} from '../Board';
import {Parts,Connector,CircuitBoard,Processor} from '../Circuitry';
import {Plate,Label,AMBER} from '../Hardware';
import {useSceneCamera} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import {useMicroSequence} from '../useMicroSequence';
import type {SceneProps} from '../types';

export function Printer({reducedMotion,scale=1,active=true}:{reducedMotion:boolean;scale?:number;active?:boolean}) {
 const sequence=useMicroSequence(active,reducedMotion,4,3.2,'cubex');
 const head=useRef<Group>(null),gantry=useRef<Group>(null),time=useRef(0);
 useFrame(()=>{time.current=sequence.progress.current;const move=sequence.running?Math.sin(time.current*Math.PI*2):0;if(head.current)head.current.position.x=reducedMotion?0:move*.45;if(gantry.current)gantry.current.position.z=reducedMotion?0:move*.2;});
 return <group scale={scale}>
  <Parts parts={[[0,.16,-.95],[-1.12,1.45,-.03],[1.16,.18,-.7]].map(p=>({position:p as [number,number,number],size:[.36,.34,.35] as [number,number,number]}))} color='#223038' metalness={.4} roughness={.5}/>
  {[-1,1].map(s=><mesh key={`lead-${s}`} position={[s*.94,.91,-.68]}><cylinderGeometry args={[.026,.026,1.52,12]}/><meshStandardMaterial color='#a5b1b8' metalness={.95} roughness={.24}/></mesh>)}
  <Line points={[[-.9,1.46,-.06],[.9,1.46,-.06],[.9,1.46,.08],[-.9,1.46,.08],[-.9,1.46,-.06]]} color='#0d161c' lineWidth={2} raycast={()=>{}}/>

  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.04,.93,z*.76] as [number,number,number],size:[.11,1.86,.11] as [number,number,number]})))} color='#8c9da5' metalness={.9} roughness={.25}/>
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.041,.94,z*.818] as [number,number,number],size:[.031,1.62,.012] as [number,number,number]})))} color='#17282f' metalness={.3} roughness={.52}/>
  {[.08,1.85].flatMap(y=>[-1,1].map(s=><group key={`${y}-${s}`}><group position={[0,y,s*.76]}><Plate width={2.18} depth={.1} height={.1} color='#75858d'/></group><group position={[s*1.04,y,0]}><Plate width={.1} depth={1.56} height={.1} color='#62747d'/></group></group>))}
  <Parts parts={[-1,1].flatMap(x=>[-1,1].flatMap(z=>[.17,1.72].map(y=>({position:[x*1.01,y,z*.73] as [number,number,number],size:[.2,.18,.19] as [number,number,number]}))))} color='#25383f' metalness={.3}/>
  <group position={[0,.22,0]}><Plate width={1.9} depth={1.4} height={.1} color='#3c4c53' bolts/><group position={[0,.08,0]}><Plate width={1.7} depth={1.22} height={.05} color='#85969d'/></group><Label text='BUILD PLATFORM' position={[0,.109,0]} width={1.28} color='#273c43'/></group>
  <Parts parts={[-.7,0,.7].flatMap(x=>Array.from({length:4},(_,i)=>({position:[x,.107+i*.019,x===0?-.48:.46] as [number,number,number],size:[.13,.012,.13] as [number,number,number]})))} color='#a4aca1' metalness={.85} roughness={.3}/>
  {[-1,1].map(s=><mesh key={s} position={[s*.88,1.52,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.035,.035,1.5,12]}/><meshStandardMaterial color='#aebec5' metalness={.96} roughness={.18}/></mesh>)}
  <group ref={gantry} position={[0,1.5,0]}>
   <Plate width={1.99} depth={.16} height={.12} color='#58717a'/>
   <Parts parts={[-1,1].map(s=>({position:[0,s*.028,-.09] as [number,number,number],size:[1.8,.012,.015] as [number,number,number]}))} color='#12232a' metalness={.04} roughness={.75}/>
   <mesh position={[0,-.1,.13]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.029,.029,1.9,12]}/><meshStandardMaterial color='#c0cbd0' metalness={.96} roughness={.16}/></mesh>
   <group ref={head} position={[0,-.04,.13]}><Plate width={.39} depth={.37} height={.31} color='#192b33' bolts/>
    <Parts parts={Array.from({length:7},(_,i)=>({position:[0,-.14-i*.016,-.11] as [number,number,number],size:[.22,.01,.16] as [number,number,number]}))} color='#9cadb4' metalness={.94} roughness={.24}/>
    <Parts parts={[-1,1].map(s=>({position:[s*.16,.14,-.08] as [number,number,number],size:[.11,.07,.18] as [number,number,number]}))} color='#637e89' metalness={.85} roughness={.28}/>
    <mesh position={[0,0,.2]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.115,.115,.034,16]}/><meshStandardMaterial color='#101a1e' roughness={.6}/></mesh>
    <Parts parts={[-1,1].flatMap(s=>[{position:[s*.047,0,.222] as [number,number,number],size:[.026,.14,.009] as [number,number,number]},{position:[0,s*.047,.222] as [number,number,number],size:[.14,.026,.009] as [number,number,number]}])} color='#75868e'/>
    <Parts parts={[-1,1].map(s=>({position:[s*.085,-.19,0] as [number,number,number],size:[.04,.12,.16] as [number,number,number]}))} color='#a7b2b1'/>
    <mesh position={[0,-.27,0]}><boxGeometry args={[.13,.12,.13]}/><meshStandardMaterial color='#a79468' metalness={.92} roughness={.3} emissive={AMBER} emissiveIntensity={sequence.running?.3:0}/></mesh>
    <mesh position={[0,-.37,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.067,.12,12]}/><meshStandardMaterial color='#bca15f' metalness={.9} roughness={.25}/></mesh>
   </group>
  </group>
  <Line points={[[-.65,.33,-.4],[.65,.33,-.4],[.65,.33,.4],[-.65,.33,.4],[-.65,.33,-.4]]} color={sequence.running?AMBER:'#ac8f55'} lineWidth={.7} transparent opacity={sequence.running?.8:.18} raycast={()=>{}}/>
  <group position={[1.12,.45,-.05]} rotation={[0,0,Math.PI/2]}><CircuitBoard width={.58} depth={.85} seed={133}/><Processor width={.25} active={false}/><group position={[0,.12,.32]}><Connector width={.44} count={6}/></group><Label text='MOTION / CTRL' position={[0,.27,-.26]} width={.49}/></group>
  <SignalTrace active={sequence.running} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.65} points={[[1.11,.35,.4],[1.11,.35,-.5],[1.11,1.75,-.5],[.3,1.75,-.5],[.3,1.53,-.5]]}/>
 </group>;
}
export default function CubexScene({reducedMotion}:SceneProps) {
 useSceneCamera();return <group position={[0,-.35,0]} rotation={[0,-.27,0]}><Board reducedMotion={reducedMotion} width={3.8} depth={3}/><Printer reducedMotion={reducedMotion} scale={1.15}/></group>;
}
