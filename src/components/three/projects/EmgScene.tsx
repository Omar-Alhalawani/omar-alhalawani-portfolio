import {RoundedBox} from '@react-three/drei';
import {Board,Block} from '../Board';
import {Label,READ,AMBER} from '../Hardware';
import {useSceneCamera} from '../useSceneData';
import Waveform from '../Waveform';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';
export default function EmgScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group rotation={[0,-.12,0]}>
    <Board width={4.4} depth={2.6}/>
    <Block position={[-1.65,.18,0]} size={[.5,.28,.65]} active color={READ}/>
    <Label text="SENSOR" position={[-1.65,.329,0]} width={.46}/>
    <Block position={[.3,.1,-.12]} size={[1.65,.13,.7]}/>
    <group position={[.3,.87,-.12]} rotation={[-.2,0,0]}>
      <RoundedBox args={[2.85,1.45,.14]} radius={.045} smoothness={2}><meshStandardMaterial color="#525b61" metalness={.8} roughness={.3}/></RoundedBox>
      <mesh position={[0,0,.075]}><planeGeometry args={[2.64,1.24]}/><meshStandardMaterial color="#0b1013" metalness={.35} roughness={.24}/></mesh>
      <Label text="SYNTHETIC RAW" position={[0,.5,.084]} width={1.7} color={READ} rotation={[0,0,0]}/>
      <Waveform position={[0,.25,.089]} width={2.4} amplitude={.14} noisy color={READ} reducedMotion={reducedMotion}/>
      <Waveform position={[0,-.2,.089]} width={2.4} amplitude={.12} reducedMotion={reducedMotion}/>
      <Label text="PROCESSING CONCEPT" position={[0,-.48,.084]} width={1.9} color={AMBER} rotation={[0,0,0]}/>
    </group>
    <SignalTrace reducedMotion={reducedMotion} points={[[-1.4,.06,0],[-.85,.06,0],[-.85,.06,.75],[.3,.06,.75],[.3,.06,.25]]}/>
  </group>;
}
