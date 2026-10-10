import {Board,Block} from '../Board';
import {useSceneCamera,useSceneData} from '../useSceneData';
import {initialFpga,arithmetic} from '../../../lib/fpga';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';

export default function FpgaScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  const state=useSceneData('fpga-demo','portfolio:fpga',initialFpga);
  const {result}=arithmetic(state);
  return <group rotation={[0,-.13,0]}>
    <Board width={4.4} depth={2.8}/>
    <Block position={[-1.4,.16,-.5]} size={[.72,.23,.7]} active/>
    <Block position={[-1.4,.16,.5]} size={[.72,.23,.7]} active color="#b3a1f4"/>
    <Block position={[.05,.2,0]} size={[1.05,.32,1.05]} active/>
    <SignalTrace reducedMotion={reducedMotion} points={[[-1.1,.08,-.5],[-.65,.08,-.5],[-.65,.08,0],[.6,.08,0],[1.3,.08,0]]}/>
    <SignalTrace reducedMotion={reducedMotion} color="#b3a1f4" points={[[-1.1,.08,.5],[-.65,.08,.5],[-.65,.08,0],[.6,.08,0],[1.3,.08,0]]}/>
    {Array.from({length:8},(_,i)=><mesh key={i} position={[1.45,.17,(i-3.5)*.27]}><sphereGeometry args={[.078,12,8]}/><meshBasicMaterial color={(result>>i)&1?'#75e4f6':'#293a51'}/></mesh>)}
  </group>;
}
