import {RoundedBox,Line} from '@react-three/drei';
import {Plate,ContactShade,AMBER} from './Hardware';

export function Board({width=4.4,depth=3,height=.12}:{width?:number;depth?:number;height?:number}) {
  return <group>
    <ContactShade width={width} depth={depth} position={[0,-height-.03,0]}/>
    <group position={[0,-height/2,0]}><Plate width={width} depth={depth} height={height} color="#171b1d" bolts rim/></group>
    <Line points={[[-width/2+.2,.006,-depth/2+.2],[width/2-.2,.006,-depth/2+.2],[width/2-.2,.006,depth/2-.2],[-width/2+.2,.006,depth/2-.2]]} color="#705734" lineWidth={.6} transparent opacity={.6}/>
  </group>;
}
export function Block({position=[0,0,0],size=[.8,.18,.7],active=false,color=AMBER}:{position?:[number,number,number];size?:[number,number,number];active?:boolean;color?:string}) {
  return <RoundedBox args={size} radius={Math.min(.045,size[1]/3)} smoothness={2} position={position}>
    <meshStandardMaterial color={active?'#38322a':'#24292d'} metalness={.8} roughness={.32} emissive={color} emissiveIntensity={active?.16:.006}/>
  </RoundedBox>;
}
