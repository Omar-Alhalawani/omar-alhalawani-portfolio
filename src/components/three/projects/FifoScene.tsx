import {Board,Block} from '../Board';
import {createFifo,slotOccupied} from '../../../lib/fifo';
import {useSceneCamera,useSceneData} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';

const locations=Array.from({length:8},(_,i)=>[-1.2+(i%4)*.8,.2,-.48+Math.floor(i/4)*.96] as [number,number,number]);
export default function FifoScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  const state=useSceneData('fifo-demo','portfolio:fifo',createFifo(8));
  return <group rotation={[0,-.12,0]}>
    <Board width={4.1} depth={2.7}/>
    {locations.map((position,i)=><group key={i}><Block position={position} size={[.58,.21,.61]} active={slotOccupied(state,i)}/><mesh position={[position[0],.31,position[2]]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.36,.38]}/><meshBasicMaterial color={slotOccupied(state,i)?'#75e4f6':'#263c56'} transparent opacity={slotOccupied(state,i)?.65:.3}/></mesh></group>)}
    <mesh position={[locations[state.wrPtr][0]-.12,.57,locations[state.wrPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#75e4f6"/></mesh>
    <mesh position={[locations[state.rdPtr][0]+.12,.57,locations[state.rdPtr][2]]} rotation={[Math.PI,0,0]}><coneGeometry args={[.1,.18,3]}/><meshBasicMaterial color="#b3a1f4"/></mesh>
    <SignalTrace reducedMotion={reducedMotion} active={state.count>0} points={[[-1.85,.05,.95],[-1.85,.05,-.85],[0,.05,-.85],[1.85,.05,-.85],[1.85,.05,.95]]}/>
  </group>;
}
