import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Line} from '@react-three/drei';
import {Color,CurvePath,LineCurve3,Group,Vector3,AdditiveBlending,PointLight,MeshBasicMaterial,SphereGeometry,SpriteMaterial,MathUtils} from 'three';
import {Line2} from 'three/addons/lines/Line2.js';
import {AMBER} from './Hardware';
import {useGlow,useResource} from './resources';
import {useDetailTier} from './quality';

export default function SignalTrace({points,color=AMBER,active=true,reducedMotion=false,offset=0,strength=1,spill=0,speed=.14,progressRef,activityRef,activityMultiplierRef,duty=1,period=12}:{points:[number,number,number][];color?:string;active?:boolean;reducedMotion?:boolean;offset?:number;strength?:number;spill?:number;speed?:number;progressRef?:RefObject<number>;activityRef?:RefObject<number>;activityMultiplierRef?:RefObject<number>;duty?:number;period?:number}) {
  const tier=useDetailTier();spill=tier==='low'?0:spill;
  const dot=useRef<Group>(null),phase=useRef(offset),light=useRef<PointLight>(null),line=useRef<Line2>(null),time=useRef(0);
  const glow=useGlow();
  const geometry=useResource('signal-dot',()=>new SphereGeometry(.018,8,6));
  const material=useResource('signal-dot-material',()=>new MeshBasicMaterial({color:new Color('#fff1ca').multiplyScalar(2.5),toneMapped:false}));
  const halo=useResource('signal-halo-material',()=>new SpriteMaterial({map:glow,transparent:true,opacity:.65,blending:AdditiveBlending,depthWrite:false,toneMapped:false}));
  const energy=useMemo(()=>new Color(color===AMBER?'#ff961c':color).multiplyScalar(1.7*strength),[color,strength]);
  const curve=useMemo(()=>{
    const route=new CurvePath<Vector3>();
    for(let i=1;i<points.length;i++)route.add(new LineCurve3(new Vector3(...points[i-1]),new Vector3(...points[i])));
    return route;
  },[points]);
  useFrame((_,delta)=>{
    if(!dot.current)return;
    if(!reducedMotion)time.current+=Math.min(delta,.25);
    const cycle=(time.current/period+offset)%1;
    const envelope=duty>=1?1:cycle<duty?MathUtils.smoothstep(cycle,0,Math.min(.05,duty/3))*(1-MathUtils.smoothstep(cycle,duty-.05,duty)):0;
    const activity=active?(reducedMotion?.7:Math.max(0,Math.min(1,activityRef?.current??envelope*(activityMultiplierRef?.current??1)))):0;
    if(active&&!reducedMotion)phase.current=progressRef?(progressRef.current+offset)%1:(phase.current+Math.min(delta,.05)*speed)%1;
    dot.current.position.copy(curve.getPoint(reducedMotion?.42:phase.current));
    dot.current.visible=active&&activity>.08;
    dot.current.scale.setScalar(.55+.45*activity);
    if(line.current){line.current.material.opacity=active?.25+.71*activity:.55;line.current.material.color.copy(energy).multiplyScalar(active?.35+.65*activity:.18);}
    if(light.current)light.current.intensity=spill*activity*(.8+.2*Math.sin(phase.current*Math.PI*2));
  });
  return <group>
    <Line ref={line} points={points} color={active?energy:'#443b2c'} lineWidth={active?1.6*strength:.65} transparent opacity={active?.96:.55} toneMapped={false} raycast={()=>{}}/>
    <group ref={dot} visible={active} position={points[0]}>
      <mesh geometry={geometry} material={material} scale={strength} dispose={null} raycast={()=>{}}/>
      <sprite material={halo} scale={[.19*strength,.19*strength,1]} dispose={null} raycast={()=>{}}/>
      {spill>0&&<pointLight ref={light} color={color} intensity={spill} distance={1.7} decay={2}/>}
    </group>
  </group>;
}
