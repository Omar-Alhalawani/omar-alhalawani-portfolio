import {RoundedBox,Line} from '@react-three/drei';

export function Board({width=4.4,depth=3,height=.12}:{width?:number;depth?:number;height?:number}) {
  return <group>
    <RoundedBox args={[width,height,depth]} radius={.04} smoothness={2} position={[0,-height/2,0]}><meshStandardMaterial color="#101b30" metalness={.6} roughness={.35}/></RoundedBox>
    <Line points={[[-width/2,.006,-depth/2],[width/2,.006,-depth/2],[width/2,.006,depth/2],[-width/2,.006,depth/2],[-width/2,.006,-depth/2]]} color="#365574" lineWidth={.7}/>
  </group>;
}

export function Block({position=[0,0,0],size=[.8,.18,.7],active=false,color='#75e4f6'}:{position?:[number,number,number];size?:[number,number,number];active?:boolean;color?:string}) {
  return <RoundedBox args={size} radius={Math.min(.045,size[1]/3)} smoothness={2} position={position}>
    <meshStandardMaterial color={active?'#1b3546':'#15243c'} metalness={.65} roughness={.3} emissive={color} emissiveIntensity={active?.15:.012}/>
  </RoundedBox>;
}
