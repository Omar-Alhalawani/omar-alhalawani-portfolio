import {useEffect,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Mesh,Vector3} from 'three';
import {Board} from '../Board';
import {Connector,Parts} from '../Circuitry';
import {MemoryBank,PowerBank} from '../ModuleHardware';
import {createFifo,slotOccupied} from '../../../lib/fifo';
import {useSceneCamera,useSceneData} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import {Label,READ,AMBER} from '../Hardware';
import type {SceneProps} from '../types';

const cell=(i:number)=>new Vector3((i%4-1.5)*.713,.67,(Math.floor(i/4)-.5)*.7935);
type Transfer={write:boolean;read:boolean;writeSlot:number;readSlot:number;reset:boolean};
export default function FifoScene({reducedMotion}:SceneProps) {
 const [probe,setProbe]=useState(''),writeActivity=useRef(0),readActivity=useRef(0);
 useEffect(()=>{const receive=(e:Event)=>{const d=(e as CustomEvent<{signal:string;enabled:boolean}>).detail;setProbe(d.enabled?d.signal:'');};window.addEventListener('portfolio:fifo-probe',receive);return()=>window.removeEventListener('portfolio:fifo-probe',receive);},[]);
 useSceneCamera();const state=useSceneData('fifo-demo','portfolio:fifo',createFifo(8)),write=useRef<Mesh>(null),read=useRef<Mesh>(null),transition=useRef({write:false,read:false,writeSlot:0,readSlot:0,progress:1});const {invalidate}=useThree();
 useEffect(()=>{const receive=(event:Event)=>{const t=(event as CustomEvent<Transfer>).detail;transition.current={write:t.write&&!t.reset,read:t.read&&!t.reset,writeSlot:t.writeSlot,readSlot:t.readSlot,progress:0};invalidate();};window.addEventListener('portfolio:fifo-transfer',receive);return()=>window.removeEventListener('portfolio:fifo-transfer',receive);},[invalidate]);
 useFrame((_,delta)=>{const t=transition.current;writeActivity.current=probe.startsWith('wr')||probe==='din'?1:t.write&&t.progress<1?1:0;readActivity.current=probe.startsWith('rd')||probe==='dout'?1:t.read&&t.progress<1?1:0;t.progress=reducedMotion?1:Math.min(1,t.progress+Math.min(delta,.05)*.8);if(write.current){write.current.visible=t.write&&(reducedMotion||t.progress<1);write.current.position.lerpVectors(new Vector3(-2.1,.55,.75),cell(t.writeSlot),t.progress);}if(read.current){read.current.visible=t.read&&(reducedMotion||t.progress<1);read.current.position.lerpVectors(cell(t.readSlot),new Vector3(2.1,.55,.75),t.progress);}});
 return <group rotation={[0,-.2,0]}>
  <Board reducedMotion={reducedMotion} width={4.35} depth={2.8}/>
  <group position={[0,.12,0]}><MemoryBank scale={1.15} occupied={state.memory.map((_,i)=>slotOccupied(state,i))} values={state.memory}/></group>
  {[-1,1].map(s=><group key={s} position={[s*1.94,.28,0]}><PowerBank count={7}/><group position={[0,.11,.79]} rotation={[0,s*Math.PI/2,0]}><Connector width={.65}/></group></group>)}
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:10},(_,i)=>({position:[(i-4.5)*.35,.09,s*1.25] as [number,number,number],size:[.13,.13,.15] as [number,number,number]})))} color='#253c42' metalness={.15}/>
  <Label text='WRITE / WR_PTR' position={[-.97,.015,1.24]} width={1.5} color={AMBER}/><Label text='READ / RD_PTR' position={[.97,.015,1.24]} width={1.5} color={READ}/>
  <Label text={`COUNT ${state.count}/8 ${state.count===0?'EMPTY':state.count===8?'FULL':''}`} position={[0,1.225,0]} width={2.5}/>
  {[['write',state.wrPtr,AMBER,-.1],['read',state.rdPtr,READ,.1]].map(([kind,i,color,dx])=><mesh key={String(kind)} position={[cell(Number(i)).x+Number(dx),1.35,cell(Number(i)).z]} rotation={[Math.PI,0,0]}><coneGeometry args={[.075,.14,3]}/><meshBasicMaterial color={String(color)}/></mesh>)}
  <mesh ref={write} visible={false}><boxGeometry args={[.12,.17,.12]}/><meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={2.5}/></mesh><mesh ref={read} visible={false}><boxGeometry args={[.12,.17,.12]}/><meshStandardMaterial color={READ} emissive={READ} emissiveIntensity={2}/></mesh>
  {probe&&<Label text={`PROBE / ${probe.toUpperCase()}`} position={[0,1.5,0]} width={2} color={probe.startsWith('rd')||probe==='dout'?READ:AMBER}/>}
  <SignalTrace activityRef={writeActivity} spill={.6} strength={1.2} reducedMotion={reducedMotion} points={[[-3,.05,.8],[-1.98,.05,.8],[-1.98,.32,.8],[-1.68,.32,.8],[-1.68,.15,.75],[-1.42,.15,.75]]}/>
  <SignalTrace activityRef={readActivity} color={READ} strength={.9} reducedMotion={reducedMotion} points={[[1.42,.15,.75],[1.68,.15,.75],[1.68,.32,.8],[1.98,.32,.8],[1.98,.05,.8],[3,.05,.8]]}/>
  <pointLight position={[0,.6,0]} color='#ffb554' intensity={1.9} distance={2.8} decay={2}/>
 </group>;
}
