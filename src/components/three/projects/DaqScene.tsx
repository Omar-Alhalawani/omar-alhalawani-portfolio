import {Board} from '../Board';
import {InstrumentTile,PowerBank} from '../ModuleHardware';
import {Connector} from '../Circuitry';
import {Label} from '../Hardware';
import {useSceneCamera} from '../useSceneData';
import SignalTrace from '../SignalTrace';
import type {SceneProps} from '../types';
export default function DaqScene({reducedMotion}:SceneProps) {
 useSceneCamera();
 return <group rotation={[0,-.12,0]}>
  <Board reducedMotion={reducedMotion} width={4.4} depth={3.3}/>
  <group position={[0,.12,0]} scale={1/.55}><InstrumentTile/></group>
  <group position={[-1.8,.24,-.3]}><PowerBank count={5}/></group>
  <group position={[1.8,.2,.3]} rotation={[0,Math.PI/2,0]}><Connector width={1.1} count={12}/></group>
  <SignalTrace reducedMotion={reducedMotion} spill={.6} points={[[-2.1,.08,.8],[-1.4,.08,.8],[-1.4,.22,.8],[0,.22,.8],[0,.5,.8]]}/>
  <Label text='4 CHANNELS / CONCEPTUAL DAQ / PYTHON GUI' position={[0,.015,1.55]} width={3.6}/>
 </group>;
}
