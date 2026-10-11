import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {CanvasTexture,Color,CurvePath,LineCurve3,Group,Vector3,AdditiveBlending} from 'three';
import {AMBER} from './Hardware';

export default function SignalTrace({points,color=AMBER,active=true,reducedMotion=false,offset=0,strength=1}:{points:[number,number,number][];color?:string;active?:boolean;reducedMotion?:boolean;offset?:number;strength?:number}) {
  const dot=useRef<Group>(null),phase=useRef(offset);
  const glow=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!,g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff7dc');g.addColorStop(.13,'#ffd18b');g.addColorStop(.36,'#ff991b77');g.addColorStop(1,'#ff7b0000');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new CanvasTexture(c);},[]);
  useEffect(()=>()=>glow.dispose(),[glow]);
  const energy=useMemo(()=>new Color(color===AMBER?'#ff961c':color).multiplyScalar(1.7*strength),[color,strength]);
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
    <Line points={points} color={active?energy:'#443b2c'} lineWidth={active?1.6*strength:.65} transparent opacity={active?.96:.55} toneMapped={false} raycast={()=>{}}/>
    <group ref={dot} visible={active} position={points[0]}>
      <mesh raycast={()=>{}}><sphereGeometry args={[.029*strength,8,6]}/><meshBasicMaterial color={new Color('#fff1ca').multiplyScalar(3)} toneMapped={false}/></mesh>
      <sprite scale={[.42*strength,.42*strength,1]} raycast={()=>{}}><spriteMaterial map={glow} color={energy} transparent opacity={.9} blending={AdditiveBlending} depthWrite={false} toneMapped={false}/></sprite>
    </group>
  </group>;
}
