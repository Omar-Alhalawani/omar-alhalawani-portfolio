import {useEffect,useMemo} from 'react';
import {Line,RoundedBox} from '@react-three/drei';
import {CanvasTexture} from 'three';

export const AMBER='#ffbd59';
export const READ='#b5d6e2';

export function Bolt({position=[0,0,0]}:{position?:[number,number,number]}) {
  return <mesh position={position}><cylinderGeometry args={[.045,.045,.024,8]}/><meshStandardMaterial color="#adb2b5" metalness={.9} roughness={.34}/></mesh>;
}
export function Plate({width=3.4,depth=2.8,height=.12,color='#202429',rim=false,bolts=false}:{width?:number;depth?:number;height?:number;color?:string;rim?:boolean;bolts?:boolean}) {
  const grain=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#b9b9b9';ctx.fillRect(0,0,128,128);for(let i=0;i<128;i++){const v=160+(i*37%70);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(0,i,128,.55);}return new CanvasTexture(c);},[]);
  useEffect(()=>()=>grain.dispose(),[grain]);
  return <group>
    <RoundedBox castShadow receiveShadow args={[width,height,depth]} radius={Math.min(.055,height/3)} smoothness={2}><meshStandardMaterial color={color} metalness={.9} roughness={.38} roughnessMap={grain} bumpMap={grain} bumpScale={.009}/></RoundedBox>
    {rim&&<Line points={[[-width/2+.08,height/2+.005,-depth/2+.08],[width/2-.08,height/2+.005,-depth/2+.08],[width/2-.08,height/2+.005,depth/2-.08],[-width/2+.08,height/2+.005,depth/2-.08],[-width/2+.08,height/2+.005,-depth/2+.08]]} color="#939a9f" lineWidth={.65} transparent opacity={.6}/>}
    {bolts&&[-1,1].flatMap(x=>[-1,1].map(z=><Bolt key={`${x}-${z}`} position={[x*(width/2-.15),height/2+.013,z*(depth/2-.15)]}/>))}
  </group>;
}
export function Chip({width=.8,depth=.8,active=false}:{width?:number;depth?:number;active?:boolean}) {
  return <group>
    <RoundedBox args={[width,.14,depth]} radius={.035} smoothness={2}><meshStandardMaterial color="#141719" metalness={.5} roughness={.32}/></RoundedBox>
    <RoundedBox args={[width*.72,.035,depth*.72]} radius={.012} smoothness={1} position={[0,.084,0]}><meshStandardMaterial color={active?'#4a3822':'#5c6367'} metalness={.95} roughness={.23} emissive={AMBER} emissiveIntensity={active?.32:0}/></RoundedBox>
    {[-1,1].map(side=><mesh key={side} position={[side*(width/2+.015),-.04,0]}><boxGeometry args={[.035,.055,depth*.83]}/><meshStandardMaterial color="#c0aa75" metalness={.85} roughness={.32}/></mesh>)}
  </group>;
}
// Texture labels are local, static, and disposed with their scene. No font requests.
export function Label({text,position=[0,.1,0],width=.9,color='#dadbd7',rotation=[-Math.PI/2,0,0]}:{text:string;position?:[number,number,number];width?:number;color?:string;rotation?:[number,number,number]}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle=color;ctx.font='500 46px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);
    return new CanvasTexture(canvas);
  },[text,color]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={position} rotation={rotation}><planeGeometry args={[width,width/4]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/></mesh>;
}
export function ContactShade({width=4,depth=3,position=[0,-.3,0]}:{width?:number;depth?:number;position?:[number,number,number]}) {
  return <mesh position={position} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width*1.3,depth*1.3]}/><shaderMaterial transparent depthWrite={false} vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader="varying vec2 vUv; void main(){float d=length((vUv-.5)*2.);gl_FragColor=vec4(0.,0.,0.,.5*(1.-smoothstep(.15,.95,d)));}"/></mesh>;
}
