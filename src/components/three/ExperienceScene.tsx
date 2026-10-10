import {useSceneCamera} from './useSceneData';
import {Board,Block} from './Board';
import SignalTrace from './SignalTrace';
import type {SceneProps} from './types';

export default function ExperienceScene({reducedMotion}:SceneProps) {
  useSceneCamera('floorplan');
  return <group rotation={[0,-.16,0]}>
    <Board width={4.7} depth={2.4}/>
    {[-1.65,-.55,.55,1.65].map((x,i)=><group key={x} position={[x,.16,0]}><Block size={[.76,.23,.82]} active={i===2}/><mesh position={[0,.13,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.49,.48]}/><meshBasicMaterial color={i===2?'#75e4f6':'#738ba9'} transparent opacity={i===2?.5:.13}/></mesh></group>)}
    <SignalTrace reducedMotion={reducedMotion} points={[[-2.1,.05,.65],[-1.65,.05,.65],[-1.65,.05,0],[-.55,.05,0],[.55,.05,0],[1.65,.05,0],[1.65,.05,-.65],[2.1,.05,-.65]]}/>
    <SignalTrace reducedMotion={reducedMotion} color="#b3a1f4" offset={.5} points={[[-2.1,.05,-.65],[-1.1,.05,-.65],[-1.1,.05,-.45],[1.1,.05,-.45],[1.1,.05,.65],[2.1,.05,.65]]}/>
  </group>;
}
