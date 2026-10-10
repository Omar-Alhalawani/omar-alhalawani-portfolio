import {Board,Block} from '../Board';
import {useSceneCamera} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';

export default function DaqScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group rotation={[0,-.12,0]}>
    <Board/>
    {[-1.6,-.5,.6,1.7].map((x,i)=><Block key={x} position={[x,.18,0]} size={[.6,.26,.8]} active={i===2} color={i<2?'#b3a1f4':'#75e4f6'}/>)}
    <SignalTrace reducedMotion={reducedMotion} points={[[-1.9,.04,.8],[-1.6,.04,.8],[-1.6,.04,0],[1.7,.04,0],[1.7,.04,-.8],[1.9,.04,-.8]]}/>
  </group>;
}
