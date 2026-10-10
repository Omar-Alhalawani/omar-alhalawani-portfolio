import {Board,Block} from '../Board';
import {Plate,Label,Chip} from '../Hardware';
import {useSceneCamera} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';
export default function DaqScene({reducedMotion}:SceneProps) {
  useSceneCamera();
  return <group rotation={[0,-.12,0]}>
    <Board/>
    <group position={[-1.2,.2,0]}><Plate width={1.75} depth={1.65} height={.3} rim bolts/>
      {[-.55,0,.55].map(x=><group key={x}><Block position={[x,.28,0]} size={[.42,.26,1.12]} active/><Label text="INPUT" position={[x,.418,0]} width={.33}/><mesh position={[x,.25,.61]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.09,.09,.15,12]}/><meshStandardMaterial color="#bab5a3" metalness={.85} roughness={.28}/></mesh></group>)}
    </group>
    <group position={[1.25,.2,0]}><Plate width={1.35} depth={1.4} height={.18} rim bolts/><group position={[0,.19,-.12]}><Chip active/></group><Label text="ACQUISITION" position={[0,.103,.54]} width={1.08}/></group>
    <SignalTrace reducedMotion={reducedMotion} points={[[-.25,.08,0],[.2,.08,0],[.2,.08,.4],[.65,.08,.4],[1.25,.3,.4]]}/>
    <Label text="CONCEPTUAL DAQ / PYTHON GUI" position={[0,.014,1.24]} width={3.3}/>
  </group>;
}
