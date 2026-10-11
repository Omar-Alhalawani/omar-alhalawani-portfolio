import {Board} from '../Board';
import {Parts,Connector} from '../Circuitry';
import {Edges} from '@react-three/drei';
import {createFifo,slotOccupied} from '../../../lib/fifo';
import {useSceneCamera,useSceneData} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import {Plate,Label,READ} from '../Hardware';
import type {SceneProps} from '../types';

const locations=Array.from({length:8},(_,i)=>[-1.2+(i%4)*.8,.2,-.48+Math.floor(i/4)*.96] as [number,number,number]);
export default function FifoScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  const state=useSceneData('fifo-demo','portfolio:fifo',createFifo(8));
  return <group rotation={[0,-.12,0]}>
    <Board reducedMotion={reducedMotion} width={4.1} depth={2.7}/>
    <group position={[0,.46,-1.1]}><Plate width={3.6} depth={.13} height={.75} color="#3f464a"/></group>
    <group position={[0,.13,1.1]}><Plate width={3.6} depth={.14} height={.13} color="#747c80"/></group>
    {[-1,1].map(side=><group key={side} position={[side*1.75,.32,0]}><Plate width={.12} depth={2.15} height={.49} color="#4f565a"/></group>)}
    <Label text="WRITE / WR_PTR" position={[-.95,.014,1.23]} width={1.5} color="#ffbd59"/>
    <Label text="READ / RD_PTR" position={[.95,.014,1.23]} width={1.5} color={READ}/>
    <Label text={`COUNT ${state.count}/8 ${state.count===0?'EMPTY':state.count===8?'FULL':''}`} position={[0,.847,-1.1]} width={2.5}/>

    {locations.map((position,i)=><group key={i} position={[position[0],.36,position[2]]}>
      <mesh><boxGeometry args={[.52,.5,.55]}/><meshPhysicalMaterial color={slotOccupied(state,i)?'#ffbd59':'#57412b'} emissive='#ffb43c' emissiveIntensity={slotOccupied(state,i)?1.9:.07} metalness={.12} roughness={.15} transparent opacity={slotOccupied(state,i)?.68:.24}/><Edges color='#ffbd59'/></mesh>
      <mesh position={[0,-.25,0]}><boxGeometry args={[.62,.08,.64]}/><meshStandardMaterial color='#606c72' metalness={.9} roughness={.25}/></mesh>
    </group>)}
    <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.7,.45,z*1.05] as [number,number,number],size:[.065,.75,.065] as [number,number,number]})))} color='#a1a8aa'/>
    <group position={[-1.94,.2,0]} rotation={[0,Math.PI/2,0]}><Connector width={1.1}/></group>
    <group position={[1.94,.2,0]} rotation={[0,-Math.PI/2,0]}><Connector width={1.1}/></group>
    <mesh position={[locations[state.wrPtr][0]-.12,.81,locations[state.wrPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#ffbd59"/></mesh>
    <mesh position={[locations[state.rdPtr][0]+.12,.81,locations[state.rdPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#b5d6e2"/></mesh>
    <SignalTrace strength={1.5} reducedMotion={reducedMotion} points={[[-2.8,.05,.95],[-1.85,.05,.95],[-1.85,.05,-.85],[0,.05,-.85],[1.85,.05,-.85],[1.85,.05,.95],[2.8,.05,.95]]}/>
    <pointLight position={[0,.5,.7]} color='#ffa63b' intensity={3} distance={3} decay={2}/>
  </group>;
}
