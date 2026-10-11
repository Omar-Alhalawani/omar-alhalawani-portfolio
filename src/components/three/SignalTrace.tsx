import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {Color,CurvePath,LineCurve3,Group,Vector3,AdditiveBlending,PointLight} from 'three';
import {AMBER} from './Hardware';
import {useGlow} from './resources';
import {useDetailTier} from './quality';

export default function SignalTrace({points,color=AMBER,active=true,reducedMotion=false,offset=0,strength=1,spill=0,speed=.14,progressRef}:{points:[number,number,number][];color?:string;active?:boolean;reducedMotion?:boolean;offset?:number;strength?:number;spill?:number;speed?:number;progressRef?:RefObject<number>}) {
  const tier=useDetailTier();spill=tier==='low'?0:spill;
  const dot=useRef<Group>(null),phase=useRef(offset),light=useRef<PointLight>(null);
  const glow=useGlow();
  const energy=useMemo(()=>new Color(color===AMBER?'#ff961c':color).multiplyScalar(1.7*strength),[color,strength]);
  const curve=useMemo(()=>{
    const route=new CurvePath<Vector3>();
    for(let i=1;i<points.length;i++)route.add(new LineCurve3(new Vector3(...points[i-1]),new Vector3(...points[i])));
    return route;
  },[points]);
  useFrame((_,delta)=>{
    if(!dot.current)return;
    if(active&&!reducedMotion)phase.current=progressRef?(progressRef.current+offset)%1:(phase.current+Math.min(delta,.05)*speed)%1;
    dot.current.position.copy(curve.getPoint(reducedMotion?.42:phase.current));
    if(light.current)light.current.intensity=active?spill*(.8+.2*Math.sin(phase.current*Math.PI*2)):0;
  });
  return <group>
    <Line points={points} color={active?energy:'#443b2c'} lineWidth={active?1.6*strength:.65} transparent opacity={active?.96:.55} toneMapped={false} raycast={()=>{}}/>
    <group ref={dot} visible={active} position={points[0]}>
      <mesh raycast={()=>{}}><sphereGeometry args={[.018*strength,8,6]}/><meshBasicMaterial color={new Color('#fff1ca').multiplyScalar(2.5)} toneMapped={false}/></mesh>
      <sprite scale={[.19*strength,.19*strength,1]} raycast={()=>{}}><spriteMaterial map={glow} transparent opacity={.65} blending={AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
      {spill>0&&<pointLight ref={light} color={color} intensity={spill} distance={1.7} decay={2}/>}
    </group>
  </group>;
}
