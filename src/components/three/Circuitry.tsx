import {useLayoutEffect,useMemo,useRef} from 'react';
import {CanvasTexture,InstancedMesh,Matrix4,Quaternion,Vector3,SRGBColorSpace} from 'three';
import {Plate,Label,AMBER} from './Hardware';
import SignalTrace from './SignalTrace';
import type {GraphicsTier} from './types';
import {useResource,useBox,useMetal} from './resources';
import {useDetailTier} from './quality';

type Box={position:[number,number,number];size:[number,number,number]};
// Repeated physical parts share one draw call per material.
export function Parts({parts,color='#202427',metalness=.75,roughness=.36,emissive=false,beveled=false}:{parts:Box[];beveled?:boolean;color?:string;metalness?:number;roughness?:number;emissive?:boolean}) {
 const ref=useRef<InstancedMesh>(null),geometry=useBox(beveled),material=useMetal(color,metalness,roughness,undefined,emissive);
 useLayoutEffect(()=>{const m=new Matrix4(),q=new Quaternion();parts.forEach((p,i)=>{m.compose(new Vector3(...p.position),q,new Vector3(...p.size));ref.current?.setMatrixAt(i,m);});if(ref.current){ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();}},[parts]);
 return <instancedMesh receiveShadow ref={ref} args={[undefined,undefined,parts.length]} raycast={()=>{}}><primitive object={geometry} attach="geometry" dispose={null}/><primitive object={material} attach="material" dispose={null}/></instancedMesh>;
}

function boardTexture(width:number,depth:number,seed:number,resolution:number) {
 const c=document.createElement('canvas');c.width=resolution;c.height=resolution;const x=c.getContext('2d')!;x.scale(resolution/1024,resolution/1024);
 let state=seed+1;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
 x.fillStyle='#111918';x.fillRect(0,0,1024,1024);
 // Fine brushed substrate and etched copper, generated locally and reproducibly.
 for(let n=0;n<2800;n++){x.fillStyle=`rgba(149,163,152,${random()*.035})`;x.fillRect(random()*1024,random()*1024,8+random()*60,.5+random());}
 for(let n=0;n<100;n++){
  const a=random()*950+35,b=random()*950+35,target=random()*850+80;
  x.strokeStyle=n%7===0?'#71512a':'#2d3b34';x.lineWidth=n%7===0?2:1;
  x.beginPath();x.moveTo(a,b);x.lineTo(a+(target-a)*.35,b);x.lineTo(a+(target-a)*.35,target);x.lineTo(target,target);x.stroke();
  x.fillStyle='#8b7752';x.beginPath();x.arc(a,b,2.2,0,Math.PI*2);x.fill();
 }
 x.strokeStyle='#8d969160';x.lineWidth=1;x.strokeRect(22,22,980,980);
 for(let n=0;n<220;n++){const a=random()*960+32,b=random()*960+32;x.strokeStyle='#9d895080';x.beginPath();x.arc(a,b,2.7,0,Math.PI*2);x.stroke();}
 // Package lands, fine fan-out and silkscreen register marks.
 for(let side=0;side<4;side++)for(let n=0;n<28;n++){
  x.save();x.translate(512,512);x.rotate(side*Math.PI/2);const p=(n-13.5)*10;
  x.fillStyle='#bbaa71';x.fillRect(p,-209,5,16);x.strokeStyle='#5e603d';x.beginPath();x.moveTo(p+2,-208);x.lineTo(p+2,-260);x.lineTo(p*1.55,-280);x.lineTo(p*1.55,-380);x.stroke();x.restore();
 }
 x.fillStyle='#a7ada4';x.font='14px monospace';x.fillText('OA // CONCEPTUAL SYSTEM',42,975);x.font='11px monospace';x.fillText(`${width.toFixed(1)} / ${depth.toFixed(1)}  —  COMPUTE SUBSTRATE`,42,54);
 const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.anisotropy=4;return t;
}

export function CircuitBoard({width=3.4,depth=2.6,tier:requestedTier,seed=1,components=true,base=true}:{width?:number;depth?:number;tier?:GraphicsTier;seed?:number;components?:boolean;base?:boolean}) {
 const inheritedTier=useDetailTier(),tier=requestedTier||inheritedTier;
 const texture=useResource(`pcb:${seed}:${width}:${depth}`,()=>boardTexture(width,depth,seed,512));
 const bodies=useMemo(()=>{
  const a:Box[]=[];const step=tier==='low'?.45:tier==='medium'?.29:.23;
  for(let z=-depth/2+.22;z<depth/2-.12;z+=step)for(let x=-width/2+.24;x<width/2-.15;x+=step){
   if(Math.abs(x)<width*.25&&Math.abs(z)<depth*.28)continue;
   const n=Math.round((x+4)*17+(z+4)*31+seed);if(n%3===0)continue;
   a.push({position:[x,.085,z],size:[n%5===0?.15:.065,n%5===0?.095:.05,n%5===0?.11:.09]});
  }return a;
 },[width,depth,tier,seed]);
 const pads=useMemo(()=>bodies.flatMap(p=>[-1,1].map(side=>({position:[p.position[0]+side*p.size[0]*.56,.08,p.position[2]] as [number,number,number],size:[.026,.038,p.size[2]*.94] as [number,number,number]}))),[bodies]);
 return <group>
  {base&&<Plate width={width} depth={depth} height={.1} color='#141b19' rim/>}
  <mesh receiveShadow position={[0,.052,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}><planeGeometry args={[width-.06,depth-.06]}/><meshStandardMaterial map={texture} bumpMap={texture} bumpScale={.009} metalness={.55} roughness={.55}/></mesh>
  {components&&<><Parts parts={bodies} color='#0d1518' metalness={.08} roughness={.62}/><Parts parts={pads} color='#b6b4a1' metalness={.9} roughness={.28}/></>}
 </group>;
}

export function Processor({width=1.2,active=true}:{width?:number;active?:boolean}) {
 const pins=useMemo(()=>{const p:Box[]=[];for(let i=0;i<24;i++)for(const side of [-1,1]){
  p.push({position:[side*width*.54,.085,(i-11.5)*width/27],size:[width*.08,.035,width/55]});p.push({position:[(i-11.5)*width/27,.085,side*width*.54],size:[width/55,.035,width*.08]});
 }return p;},[width]);
 const fins=useMemo(()=>Array.from({length:13},(_,i)=>({position:[(i-6)*width*.052,.246,0] as [number,number,number],size:[width*.025,.024,width*.64] as [number,number,number]})),[width]);
 const tier=useDetailTier();
 return <group>
  <Plate width={width*1.27} depth={width*1.27} height={.075} color='#3d4239'/>
  <mesh castShadow position={[0,.12,0]}><boxGeometry args={[width,.16,width]}/><meshStandardMaterial color='#151c21' metalness={.12} roughness={.58}/></mesh>
  <group position={[0,.22,0]}><Plate width={width*.75} depth={width*.72} height={.05} color='#172126'/></group>
  <Parts parts={tier==='low'?pins.filter((_,i)=>i%2===0):pins} color='#bbad84' roughness={.27}/><Parts parts={tier==='low'?fins.filter((_,i)=>i%2===0):fins} color='#4d6068' roughness={.25}/>
  <Label text='OA / COMPUTE' position={[0,.263,0]} width={width*.57}/>
  {active&&[-1,1].map(side=><mesh key={side} position={[side*width*.49,.142,0]}><boxGeometry args={[.018,.09,width*.8]}/><meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={1.6} toneMapped={false}/></mesh>)}
 </group>;
}

export function Connector({width=1,count=12}:{width?:number;count?:number}) {
 const pins=useMemo(()=>Array.from({length:count},(_,i)=>({position:[(i-(count-1)/2)*width/count,.09,.12] as [number,number,number],size:[width/count*.3,.08,.2] as [number,number,number]})),[width,count]);
 return <group><Plate width={width+.1} depth={.22} height={.18} color='#22292a'/><Parts parts={pins} color='#c5b57f'/></group>;
}

export function SystemBed({reducedMotion,tier:requestedTier,width=7.8,depth=6}:{reducedMotion:boolean;tier?:GraphicsTier;width?:number;depth?:number}) {
 const inheritedTier=useDetailTier(),tier=requestedTier||inheritedTier;
 return <group>
  <CircuitBoard width={width} depth={depth} tier={tier} seed={33} components={false}/>
  <group position={[-width*.38,.08,-depth*.29]}><CircuitBoard width={1.1} depth={1.3} tier={tier} seed={41}/><Processor width={.45} active={false}/></group>
  <group position={[width*.36,.09,depth*.25]}><CircuitBoard width={1.2} depth={1.1} tier={tier} seed={47}/><Connector width={.7} count={8}/></group>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:tier==='low'?8:15},(_,i)=>({position:[s*width*.43,.1,(i-7)*depth/18] as [number,number,number],size:[.25,.14,.16] as [number,number,number]})))} color='#17272c' metalness={.15} roughness={.67}/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:18},(_,i)=>({position:[(i-8.5)*width/22,.11,s*depth*.43] as [number,number,number],size:[.17,.065,.19] as [number,number,number]})))} color='#28373b' metalness={.6} roughness={.4}/>
  {[-1,1].map(s=><group key={s} position={[s*width*.35,.07,-depth*.36]}><CircuitBoard width={1.2} depth={.85} tier={tier} seed={42+s}/><Processor width={.52} active={false}/><group position={[0,.1,.48]}><Connector width={.9}/></group></group>)}
  {[-1,1].flatMap(side=>[0,1,2].map(n=><SignalTrace key={`${side}-${n}`} reducedMotion={reducedMotion} offset={n*.19+(side+1)*.18} strength={n===1?1.4:.8} points={[[side*width*.48,.074,-depth*.4+n*.23],[side*(1.7+n*.21),.074,-depth*.4+n*.23],[side*(1.7+n*.21),.074,depth*.23+n*.2],[side*width*.48,.074,depth*.23+n*.2]]}/>))}
 </group>;
}
