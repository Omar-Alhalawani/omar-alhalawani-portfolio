import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {CurvePath,LineCurve3,Group,Vector3} from 'three';
import {AMBER} from './Hardware';

export default function SignalTrace({points,color=AMBER,active=true,reducedMotion=false,offset=0}:{points:[number,number,number][];color?:string;active?:boolean;reducedMotion?:boolean;offset?:number}) {
  const dot=useRef<Group>(null),phase=useRef(offset);
  const curve=useMemo(()=>{
    const route=new CurvePath<Vector3>();
    for(let i=1;i<points.length;i++)route.add(new LineCurve3(new Vector3(...points[i-1]),new Vector3(...points[i])));
    return route;
  },[points]);
  useFrame((_,delta)=>{
    if(!dot.current)return;
    if(active&&!reducedMotion)phase.current=(phase.current+Math.min(delta,.05)*.24)%1;
    dot.current.position.copy(curve.getPoint(reducedMotion?.42:phase.current));
  });
  return <group>
    <Line points={points} color="#6a5332" lineWidth={1.7} transparent opacity={.45}/>
    {active&&<Line points={points} color={color} lineWidth={5} transparent opacity={.07}/>}
    <Line points={points} color={active?color:'#443b2c'} lineWidth={active?1.4:.65} transparent opacity={active?.9:.55}/>
    <group ref={dot} visible={active} position={points[0]}>
      <mesh><sphereGeometry args={[.028,8,6]}/><meshBasicMaterial color="#ffe4ad" toneMapped={false}/></mesh>
      <mesh><sphereGeometry args={[.065,8,6]}/><meshBasicMaterial color={color} transparent opacity={.14} depthWrite={false} toneMapped={false}/></mesh>
    </group>
  </group>;
}
