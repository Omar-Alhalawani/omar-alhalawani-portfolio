import {Board,Block} from '../Board';
import {useSceneCamera,useSceneData} from '../useSceneData';
import {initialFpga,arithmetic} from '../../../lib/fpga';
import SignalTrace from '../SignalTrace';
import {Chip,Label} from '../Hardware';
import type {SceneProps} from '../types';

export default function FpgaScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  const state=useSceneData('fpga-demo','portfolio:fpga',initialFpga);
  const {result}=arithmetic(state);
  return <group rotation={[0,-.13,0]}>
    <Board width={4.4} depth={2.8}/>
    <Block position={[-1.4,.16,-.5]} size={[.72,.23,.7]} active/>
    <Block position={[-1.4,.16,.5]} size={[.72,.23,.7]} active color="#b5d6e2"/>
    <group position={[.05,.27,0]}><Chip width={1.05} depth={1.05} active/></group><Label text="ALU" position={[.05,.378,0]} width={.65}/><Label text="A REG" position={[-1.4,.281,-.5]} width={.55}/><Label text="B REG" position={[-1.4,.281,.5]} width={.55}/><Label text="LED[7:0]" position={[1.45,.017,1.2]} width={.8}/>
    <SignalTrace reducedMotion={reducedMotion} points={[[-1.1,.08,-.5],[-.65,.08,-.5],[-.65,.08,0],[.6,.08,0],[1.3,.08,0]]}/>
    <SignalTrace reducedMotion={reducedMotion} color="#b5d6e2" points={[[-1.1,.08,.5],[-.65,.08,.5],[-.65,.08,0],[.6,.08,0],[1.3,.08,0]]}/>
    {Array.from({length:8},(_,i)=><mesh key={i} position={[1.45,.17,(i-3.5)*.27]}><sphereGeometry args={[.078,12,8]}/><meshBasicMaterial color={(result>>i)&1?'#ffbd59':'#353b3e'}/></mesh>)}
  </group>;
}
