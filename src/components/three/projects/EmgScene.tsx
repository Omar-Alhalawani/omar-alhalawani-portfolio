import {Board,Block} from '../Board';
import {useSceneCamera} from '../useSceneData';
import Waveform from '../Waveform';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';

export default function EmgScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group rotation={[0,-.12,0]}>
    <Board width={4.4} depth={2.6}/>
    <Block position={[-1.65,.15,0]} size={[.5,.22,.65]} active color="#b5d6e2"/>
    <Waveform position={[.25,.7,-.5]} width={2.9} amplitude={.28} noisy color="#b5d6e2" reducedMotion={reducedMotion}/>
    <Waveform position={[.25,.4,.5]} width={2.9} amplitude={.24} reducedMotion={reducedMotion}/>
    <SignalTrace reducedMotion={reducedMotion} points={[[-1.4,.06,0],[-.85,.06,0],[-.85,.06,.75],[1.75,.06,.75]]}/>
  </group>;
}
