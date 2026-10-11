import {RoundedBox} from '@react-three/drei';
import {ContactShade,AMBER} from './Hardware';
import {CircuitBoard,SystemBed} from './Circuitry';

export function Board({width=4.4,depth=3,height=.12,reducedMotion=false}:{width?:number;depth?:number;height?:number;reducedMotion?:boolean}) {
  return <group>
    <ContactShade width={width} depth={depth} position={[0,-height-.03,0]}/>
    <group position={[0,-height-.14,0]}><SystemBed width={width*1.45} depth={depth*1.5} reducedMotion={reducedMotion}/></group>
    <group position={[0,-.06,0]}><CircuitBoard width={width} depth={depth} seed={81}/></group>
  </group>;
}
export function Block({position=[0,0,0],size=[.8,.18,.7],active=false,color=AMBER}:{position?:[number,number,number];size?:[number,number,number];active?:boolean;color?:string}) {
  return <RoundedBox args={size} radius={Math.min(.045,size[1]/3)} smoothness={2} position={position}>
    <meshStandardMaterial color={active?'#38322a':'#24292d'} metalness={.8} roughness={.32} emissive={color} emissiveIntensity={active?.16:.006}/>
  </RoundedBox>;
}
