import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Mesh} from 'three';
import {MemoryBank} from './ModuleHardware';
import {Label,AMBER,READ} from './Hardware';
import SignalTrace from './SignalTrace';
import {useMicroSequence} from './useMicroSequence';
export default function FifoActivity({active,reducedMotion}:{active:boolean;reducedMotion:boolean}){
 const sequence=useMicroSequence(active,reducedMotion,5,3.6,'fifo',undefined,{loop:true,pause:1.9}),token=useRef<Mesh>(null);
 const filled=sequence.stage>=1&&sequence.stage<4;
 useFrame(()=>{if(!token.current)return;const p=sequence.progress.current;token.current.visible=sequence.running&&(p<.2||p>.6&&p<.8);token.current.position.set(p<.2?-1.65+p*3.6:-.93+(p-.6)*12,.8,-.34);});
 return <group><MemoryBank occupied={Array.from({length:8},(_,i)=>filled&&i===0)}/>
 <Label text={`COUNT ${filled?1:0} / WR ${sequence.stage>=2?1:0} / RD ${sequence.stage>=4?1:0}`} position={[0,1.03,0]} width={1.8} color={sequence.stage>=3?READ:AMBER}/>
 <mesh ref={token} visible={false}><boxGeometry args={[.11,.11,.11]}/><meshBasicMaterial color={sequence.stage<3?AMBER:READ}/></mesh>
 <SignalTrace active={sequence.running&&sequence.stage<2} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.6} points={[[-1.5,.18,.7],[-.93,.18,.7],[-.93,.7,-.34]]}/>
 <SignalTrace active={sequence.running&&sequence.stage>=3} color={READ} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.6} points={[[-.93,.7,-.34],[1.4,.7,-.34],[1.4,.18,.7]]}/>
 </group>;
}
