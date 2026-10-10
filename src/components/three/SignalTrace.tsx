import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {CatmullRomCurve3,Mesh,Vector3} from 'three';

export default function SignalTrace({points,color='#75e4f6',active=true,reducedMotion=false,offset=0}:{points:[number,number,number][];color?:string;active?:boolean;reducedMotion?:boolean;offset?:number}) {
  const dot=useRef<Mesh>(null),phase=useRef(offset);
  const curve=useMemo(()=>new CatmullRomCurve3(points.map(point=>new Vector3(...point)),false,'centripetal'),[points]);
  useFrame((_,delta)=>{
    if(!dot.current)return;
    if(active&&!reducedMotion)phase.current=(phase.current+Math.min(delta,.05)*.85)%1;
    dot.current.position.copy(curve.getPoint(reducedMotion?.4:phase.current));
  });
  return <group>
    <Line points={points} color={active?color:'#284158'} lineWidth={active?1.15:.65} transparent opacity={active?.75:.55}/>
    <mesh ref={dot} visible={active} position={points[0]}><sphereGeometry args={[.035,8,6]}/><meshBasicMaterial color={color}/></mesh>
  </group>;
}
