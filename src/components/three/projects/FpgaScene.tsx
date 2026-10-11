import {Board} from '../Board';
import {ArithmeticTile,PowerBank} from '../ModuleHardware';
import {Connector} from '../Circuitry';
import {useSceneCamera,useSceneData} from '../useSceneData';
import {initialFpga,arithmetic} from '../../../lib/fpga';
import {Label} from '../Hardware';
import type {SceneProps} from '../types';
export default function FpgaScene({reducedMotion}:SceneProps) {
 useSceneCamera();const state=useSceneData('fpga-demo','portfolio:fpga',initialFpga),{result}=arithmetic(state);
 return <group rotation={[0,-.18,0]}><Board reducedMotion={reducedMotion} width={4.4} depth={3}/><group position={[0,.12,0]}><ArithmeticTile a={state.a} b={state.b} result={result} switches={state.switches} reducedMotion={reducedMotion}/></group><group position={[0,.2,-1.25]}><Connector width={2.4} count={24}/></group><group position={[1.96,.18,0]}><PowerBank count={8}/></group><Label text='INPUT / SYNC / REGISTERS / ARITHMETIC / LED[7:0]' position={[0,.025,1.36]} width={3.8}/></group>;
}
