import {Board} from '../Board';
import {OpticalTile,PowerBank} from '../ModuleHardware';
import {CircuitBoard,Processor} from '../Circuitry';
import {useSceneCamera} from '../useSceneData';
import type {SceneProps} from '../types';
export default function LumaScene({reducedMotion,tier}:SceneProps) {
 useSceneCamera();return <group rotation={[0,-.22,0]}><Board reducedMotion={reducedMotion} width={4.5} depth={2.8}/><group position={[0,.15,0]}><OpticalTile reducedMotion={reducedMotion}/></group><group position={[1.28,.13,1.03]}><CircuitBoard width={1.3} depth={.5} tier={tier} seed={94}/><Processor width={.38}/></group><group position={[-1.88,.22,-.28]}><PowerBank count={4}/></group></group>;
}
