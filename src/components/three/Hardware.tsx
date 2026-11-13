import {Line,RoundedBox,Text} from '@react-three/drei';
import {CylinderGeometry,InstancedMesh,Matrix4,Mesh,Vector3} from 'three';
import {useEffect,useLayoutEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import labelFont from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url';
import {labelLayout} from '../../lib/scene-labels';
import {useDetailTier} from './quality';
import {useSteelGrain,usePlateGeometry,useMetal,useResource} from './resources';

export const AMBER='#ffbd59';
export const READ='#b5d6e2';

export function Bolt({position=[0,0,0]}:{position?:[number,number,number]}) {
  return <mesh position={position}><cylinderGeometry args={[.045,.045,.024,8]}/><meshStandardMaterial color="#adb2b5" metalness={.9} roughness={.34}/></mesh>;
}
function BoltSet({width,depth,y}:{width:number;depth:number;y:number}) {
 const ref=useRef<InstancedMesh>(null),material=useMetal('#adb2b5',.9,.34);
 const geometry=useResource('fastener-geometry',()=>new CylinderGeometry(.045,.045,.024,8));
 useLayoutEffect(()=>{let i=0;const m=new Matrix4();for(const x of [-1,1])for(const z of [-1,1])ref.current?.setMatrixAt(i++,m.makeTranslation(x*(width/2-.15),y,z*(depth/2-.15)));if(ref.current)ref.current.instanceMatrix.needsUpdate=true;},[width,depth,y]);
 return <instancedMesh ref={ref} args={[geometry,material,4]} dispose={null}/>;
}
export function Plate({width=3.4,depth=2.8,height=.12,color='#202429',rim=false,bolts=false,metalness=.88,roughness=.4}:{width?:number;depth?:number;height?:number;color?:string;rim?:boolean;bolts?:boolean;metalness?:number;roughness?:number}) {
  const tier=useDetailTier(),grain=useSteelGrain(),geometry=usePlateGeometry(width,height,depth,tier==='low'?1:2),material=useMetal(color,metalness,roughness,grain);
  return <group>
    <mesh castShadow receiveShadow geometry={geometry} material={material} dispose={null}/>
    {rim&&<Line points={[[-width/2+.08,height/2+.005,-depth/2+.08],[width/2-.08,height/2+.005,-depth/2+.08],[width/2-.08,height/2+.005,depth/2-.08],[-width/2+.08,height/2+.005,depth/2-.08],[-width/2+.08,height/2+.005,-depth/2+.08]]} color="#939a9f" lineWidth={.65} transparent opacity={.6}/>}
    {bolts&&<BoltSet width={width} depth={depth} y={height/2+.013}/>}
  </group>;
}
export function Chip({width=.8,depth=.8,active=false}:{width?:number;depth?:number;active?:boolean}) {
  return <group>
    <RoundedBox args={[width,.14,depth]} radius={.035} smoothness={2}><meshStandardMaterial color="#141719" metalness={.5} roughness={.32}/></RoundedBox>
    <RoundedBox args={[width*.72,.035,depth*.72]} radius={.012} smoothness={1} position={[0,.084,0]}><meshStandardMaterial color={active?'#4a3822':'#5c6367'} metalness={.95} roughness={.23} emissive={AMBER} emissiveIntensity={active?.32:0}/></RoundedBox>
    {[-1,1].map(side=><mesh key={side} position={[side*(width/2+.015),-.04,0]}><boxGeometry args={[.035,.055,depth*.83]}/><meshStandardMaterial color="#c0aa75" metalness={.85} roughness={.32}/></mesh>)}
  </group>;
}
// Signed-distance glyphs retain clean edges at oblique angles and during zoom.
// Tiny markings are omitted rather than rendered as unreadable pixel noise;
// primary labels also have full-size HTML equivalents beside every scene.
export function Label({text,position=[0,.1,0],width=.9,color='#dadbd7',rotation=[-Math.PI/2,0,0]}:{text:string;position?:[number,number,number];width?:number;color?:string;rotation?:[number,number,number]}) {
 const mesh=useRef<Mesh>(null),clock=useRef(Infinity),top=useRef(new Vector3()),bottom=useRef(new Vector3());
 const {size}=useThree(),layout=labelLayout(text,width);
 useEffect(()=>{clock.current=Infinity;},[text,width,size.width,size.height]);
 useFrame(({camera},delta)=>{
  clock.current+=delta;if(clock.current<.125||!mesh.current)return;clock.current=0;
  mesh.current.updateWorldMatrix(true,false);
  top.current.set(0,layout.fontSize*.5,0).applyMatrix4(mesh.current.matrixWorld).project(camera);
  bottom.current.set(0,-layout.fontSize*.5,0).applyMatrix4(mesh.current.matrixWorld).project(camera);
  const pixels=Math.hypot((top.current.x-bottom.current.x)*size.width/2,(top.current.y-bottom.current.y)*size.height/2);
  mesh.current.visible=pixels>=(mesh.current.visible?11:13);
 });
 return <Text ref={mesh} position={position} rotation={rotation} font={labelFont} characters="" fontSize={layout.fontSize} maxWidth={width} lineHeight={1.15} anchorX="center" anchorY="middle" textAlign="center" color={color} sdfGlyphSize={64} depthOffset={-1} material-toneMapped={false} material-depthWrite={false} onUpdate={object=>{(object as Mesh&{gpuAccelerateSDF:boolean}).gpuAccelerateSDF=false;}} raycast={()=>{}}>{layout.text}</Text>;
}
export function ContactShade({width=4,depth=3,position=[0,-.3,0]}:{width?:number;depth?:number;position?:[number,number,number]}) {
  return <mesh position={position} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width*1.3,depth*1.3]}/><shaderMaterial transparent depthWrite={false} vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader="varying vec2 vUv; void main(){float d=length((vUv-.5)*2.);gl_FragColor=vec4(0.,0.,0.,.5*(1.-smoothstep(.15,.95,d)));}"/></mesh>;
}
