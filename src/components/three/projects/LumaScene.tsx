import {Board,Block} from '../Board';
import {useSceneCamera} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';

export default function LumaScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group rotation={[0,-.15,0]}>
    <Board width={4.5} depth={2.6}/>
    <Block position={[-1.4,.2,0]} size={[.65,.4,.9]} active/>
    <Block position={[1.3,.2,0]} size={[.8,.4,.9]} active color="#b3a1f4"/>
    <mesh position={[-1.03,.35,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.15,.15,.05,20]}/><meshBasicMaterial color="#75e4f6"/></mesh>
    <mesh position={[.84,.35,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.18,.18,.08,20]}/><meshStandardMaterial color="#234459" metalness={.8} roughness={.2}/></mesh>
    <SignalTrace reducedMotion={reducedMotion} points={[[-1,.35,0],[0,.35,0],[.85,.35,0]]}/>
    <SignalTrace reducedMotion={reducedMotion} color="#b3a1f4" offset={.4} points={[[1.3,.06,.6],[1.3,.06,1],[.1,.06,1],[-.1,.06,.8]]}/>
  </group>;
}
