import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CatmullRomCurve3,Vector3,Group,Color,TubeGeometry} from 'three';

export default function EnergyRibbon({points,reducedMotion,offset=0,spill=0}:{points:[number,number,number][];reducedMotion:boolean;offset?:number;spill?:number}) {
 const dot=useRef<Group>(null),phase=useRef(offset);
 const curve=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'),[points]);
 const core=useMemo(()=>new TubeGeometry(curve,180,.009,5,false),[curve]);
 const halo=useMemo(()=>new TubeGeometry(curve,180,.034,5,false),[curve]);
 useEffect(()=>()=>{core.dispose();halo.dispose();},[core,halo]);
 useFrame((_,delta)=>{if(!reducedMotion)phase.current=(phase.current+Math.min(delta,.05)*.1)%1;dot.current?.position.copy(curve.getPointAt(reducedMotion?.32:phase.current));});
 return <group raycast={()=>{}}>
  <mesh geometry={core} raycast={()=>{}}><meshBasicMaterial color={new Color('#ff931a').multiplyScalar(1.75)} toneMapped={false}/></mesh>
  <mesh geometry={halo} raycast={()=>{}}><meshBasicMaterial color='#ffb858' transparent opacity={.045} depthWrite={false} toneMapped={false}/></mesh>
  <group ref={dot} position={points[0]}><mesh raycast={()=>{}}><sphereGeometry args={[.026,8,6]}/><meshBasicMaterial color={new Color('#ffe4b6').multiplyScalar(2.8)} toneMapped={false}/></mesh>{spill>0&&<pointLight color='#ffb651' intensity={spill} distance={2.2} decay={2}/>}</group>
 </group>;
}
