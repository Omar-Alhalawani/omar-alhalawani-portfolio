import {Board,Block} from '../Board';
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
    <Board width={4.1} depth={2.7}/>
    <group position={[0,.46,-1.1]}><Plate width={3.6} depth={.13} height={.75} color="#3f464a"/></group>
    <group position={[0,.13,1.1]}><Plate width={3.6} depth={.14} height={.13} color="#747c80"/></group>
    {[-1,1].map(side=><group key={side} position={[side*1.75,.32,0]}><Plate width={.12} depth={2.15} height={.49} color="#4f565a"/></group>)}
    <Label text="WRITE / WR_PTR" position={[-.95,.014,1.23]} width={1.5} color="#ffbd59"/>
    <Label text="READ / RD_PTR" position={[.95,.014,1.23]} width={1.5} color={READ}/>
    <Label text={`COUNT ${state.count}/8 ${state.count===0?'EMPTY':state.count===8?'FULL':''}`} position={[0,.847,-1.1]} width={2.5}/>

    {locations.map((position,i)=><group key={i}><Block position={position} size={[.58,.21,.61]} active={slotOccupied(state,i)}/><mesh position={[position[0],.31,position[2]]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.36,.38]}/><meshBasicMaterial color={slotOccupied(state,i)?'#ffbd59':'#343a3e'} transparent opacity={slotOccupied(state,i)?.65:.3}/></mesh></group>)}
    <mesh position={[locations[state.wrPtr][0]-.12,.57,locations[state.wrPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#ffbd59"/></mesh>
    <mesh position={[locations[state.rdPtr][0]+.12,.57,locations[state.rdPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#b5d6e2"/></mesh>
    <SignalTrace reducedMotion={reducedMotion} active={state.count>0} points={[[-1.85,.05,.95],[-1.85,.05,-.85],[0,.05,-.85],[1.85,.05,-.85],[1.85,.05,.95]]}/>
  </group>;
}
