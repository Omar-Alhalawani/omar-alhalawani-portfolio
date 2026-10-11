import {Board} from '../Board';
import {AcquisitionTile,PowerBank} from '../ModuleHardware';
import {Connector} from '../Circuitry';
import {useSceneCamera} from '../useSceneData';
import type {SceneProps} from '../types';
export default function EmgScene({reducedMotion}:SceneProps) {
 useSceneCamera();return <group rotation={[0,-.17,0]}><Board reducedMotion={reducedMotion} width={4.4} depth={2.8}/><group position={[0,.1,0]}><AcquisitionTile reducedMotion={reducedMotion}/></group><group position={[1.9,.23,.3]}><PowerBank count={5}/></group><group position={[-1.25,.16,1.12]}><Connector width={1.1}/></group></group>;
}
