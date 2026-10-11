import {useLayoutEffect,useRef} from 'react';
import {RoundedBox} from '@react-three/drei';
import {InstancedMesh,Matrix4} from 'three';
import {Plate,Label,AMBER,READ} from './Hardware';
import {Parts,Processor,Connector} from './Circuitry';
import {useMetal,useResource,canvasTexture} from './resources';
import {useDetailTier} from './quality';
import SignalTrace from './SignalTrace';
import Waveform from './Waveform';

// Open manufactured frames preserve the view of the PCB and its internal routes.
export function Frame({width=2.8,depth=2,height=.42}:{width?:number;depth?:number;height?:number}) {
 const tier=useDetailTier();
 return <group>
  <Parts parts={[-1,1].flatMap(s=>[{position:[s*(width/2-.05),height/2,0] as [number,number,number],size:[.1,height,depth] as [number,number,number]},{position:[0,height/2,s*(depth/2-.05)] as [number,number,number],size:[width-.18,height,.1] as [number,number,number]}])} color='#334149' metalness={.85} roughness={.33} beveled={tier!=='low'}/>
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*(width/2-.13),height*.56,z*(depth/2-.13)] as [number,number,number],size:[.13,height+.07,.13] as [number,number,number]})))} color='#a3afb3' metalness={.92} roughness={.22}/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:12},(_,i)=>({position:[(i-5.5)*(width-.5)/12,height*.53,s*(depth/2+.003)] as [number,number,number],size:[.055,.035,.02] as [number,number,number]})))} color='#131b1e' metalness={.1}/>
 </group>;
}

function CapacitorRow({count,cap=false}:{count:number;cap?:boolean}) {
 const ref=useRef<InstancedMesh>(null),material=useMetal(cap?'#a9b4b8':'#141b1e',cap?.93:.32,cap?.22:.4);
 useLayoutEffect(()=>{const m=new Matrix4();for(let i=0;i<count;i++)ref.current?.setMatrixAt(i,m.makeTranslation(0,cap?.1:0,(i-(count-1)/2)*.19));if(ref.current)ref.current.instanceMatrix.needsUpdate=true;},[count,cap]);
 return <instancedMesh ref={ref} args={[undefined,undefined,count]} raycast={()=>{}}><cylinderGeometry args={[cap?.061:.067,cap?.061:.067,cap?.016:.19,12]}/><primitive object={material} attach="material" dispose={null}/></instancedMesh>;
}
export function PowerBank({count=6}:{count?:number}) {
 const tier=useDetailTier();count=tier==='low'?Math.max(3,Math.ceil(count*.65)):count;
 return <group><CapacitorRow count={count}/><CapacitorRow count={count} cap/><Parts parts={Array.from({length:count},(_,i)=>({position:[0,.11,(i-(count-1)/2)*.19] as [number,number,number],size:[.07,.007,.008] as [number,number,number]}))} color='#29373e'/></group>;
}

export function MemoryBank({occupied=Array(8).fill(false),values=[],scale=1}:{occupied?:boolean[];values?:(number|null)[];scale?:number}) {
 const slots=Array.from({length:8},(_,i)=>({i,x:(i%4-1.5)*.62,z:(Math.floor(i/4)-.5)*.69})),tier=useDetailTier();
 return <group scale={scale}>
  <Plate width={2.85} depth={1.65} height={.12} color='#202a2c' rim bolts/><Frame width={2.85} depth={1.65} height={.2}/>
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.32,.46,z*.7] as [number,number,number],size:[.075,.85,.075] as [number,number,number]})))} color='#6f8088' roughness={.23}/>
  <group position={[0,.93,0]}><Frame width={2.85} depth={1.65} height={.065}/></group>
  <Parts parts={slots.map(s=>({position:[s.x,.14,s.z] as [number,number,number],size:[.5,.14,.55] as [number,number,number]}))} color='#101e23' metalness={.13} roughness={.65}/>
  <Parts parts={slots.map(s=>({position:[s.x,.44,s.z] as [number,number,number],size:[.43,.53,.1] as [number,number,number]}))} color='#23413c' metalness={.25} roughness={.57}/>
  <Parts parts={slots.map(s=>({position:[s.x,.45,s.z+.064] as [number,number,number],size:[.31,.34,.055] as [number,number,number]}))} color='#121c23' metalness={.08} roughness={.5}/>
  <Parts parts={slots.flatMap(s=>[-1,1].flatMap(side=>Array.from({length:tier==='low'?3:6},(_,n)=>({position:[s.x+side*.185,.3+n*.045,s.z+.045] as [number,number,number],size:[.05,.025,.04] as [number,number,number]}))))} color='#bea366' metalness={.94} roughness={.24}/>
  {[false,true].map(on=><Parts key={String(on)} parts={slots.filter(s=>Boolean(occupied[s.i])===on).map(s=>({position:[s.x,.7,s.z] as [number,number,number],size:[.32,.025,.11] as [number,number,number]}))} color={on?AMBER:'#344b4c'} metalness={.3} emissive={on}/>)}
  {slots.map(s=><Label key={s.i} text={occupied[s.i]&&values[s.i]!=null?values[s.i]!.toString(16).toUpperCase().padStart(2,'0'):`0${s.i}`} position={[s.x,.48,s.z+.096]} rotation={[0,0,0]} width={.27} color={occupied[s.i]?AMBER:'#9ba7a7'}/>)}
  <mesh position={[0,.95,0]}><boxGeometry args={[2.54,.018,1.37]}/><meshPhysicalMaterial color='#b6cbd0' roughness={.16} metalness={.08} transparent opacity={.06} depthWrite={false}/></mesh>
  <Label text='MEMORY ARRAY / 8 × WORD' width={1.4} position={[0,.99,.77]}/>
 </group>;
}

export function ArithmeticTile({a=0,b=0,result=0,switches=21,reducedMotion,active=true,scale=1}:{a?:number;b?:number;result?:number;switches?:number;reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
  <Frame width={3.6} depth={2.45} height={.13}/>
  <group position={[-1.43,.18,0]}>
   <Plate width={.48} depth={1.65} height={.13} color='#682b20'/>
   {Array.from({length:8},(_,i)=><group key={i} position={[0,.11,(i-3.5)*.18]}><mesh><boxGeometry args={[.32,.12,.13]}/><meshStandardMaterial color='#0e171a' roughness={.7}/></mesh><mesh position={[(switches>>i)&1?.08:-.08,.07,0]}><boxGeometry args={[.09,.028,.065]}/><meshStandardMaterial color='#c6cace' metalness={.3}/></mesh></group>)}
  </group>
  {[-1,1].map((s,i)=><group key={s} position={[-.62,.17,s*.62]}><Plate width={.65} depth={.62} height={.14} color='#202c2d'/><Parts parts={Array.from({length:8},(_,n)=>({position:[(n-3.5)*.071,.1,.22] as [number,number,number],size:[.034,.045,.09] as [number,number,number]}))} color='#c0af7c'/><Label text={`${i===0?'A':'B'} ${i===0?a:b}`} position={[0,.081,0]} width={.48}/></group>)}
  <group position={[.38,.22,0]}><Processor width={.95} active={active}/><Label text='ALU' position={[0,.31,0]} width={.52}/></group>
  <group position={[-.65,.12,0]}><Parts parts={[-.09,.09].map(x=>({position:[x,.09,0] as [number,number,number],size:[.13,.09,.19] as [number,number,number]}))} color='#66747c'/></group>
  <group position={[1.4,.2,0]}><Plate width={.36} depth={1.78} height={.1} color='#4d5f63'/>{Array.from({length:8},(_,i)=><mesh key={i} position={[0,.095,(i-3.5)*.2]}><sphereGeometry args={[.062,12,8]}/><meshStandardMaterial color={(result>>i)&1?AMBER:'#203333'} emissive={AMBER} emissiveIntensity={(result>>i)&1?2.2:0} roughness={.25}/></mesh>)}</group>
  <Label text='SW[7:0]' position={[-1.43,.275,-1]} width={.46}/><Label text='LED[7:0]' position={[1.4,.28,-1]} width={.56}/>
  {[-1,1].map(s=><SignalTrace key={s} active={active} reducedMotion={reducedMotion} strength={.8} points={[[-1.45,.09,s*.62],[-.62,.09,s*.62],[-.18,.09,s*.62],[-.18,.09,0],[.38,.11,0],[1.4,.11,0]]}/>)}
 </group>;
}

export function AcquisitionTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
  <Parts parts={[-1,1].map(s=>({position:[.5+s*.7,.38,-.51] as [number,number,number],size:[.1,.65,.12] as [number,number,number]}))} color='#788b94' metalness={.9} roughness={.28}/>
  <Parts parts={[-1,1].map(s=>({position:[.5+s*.7,.12,-.48] as [number,number,number],size:[.28,.055,.55] as [number,number,number]}))} color='#667980'/>
  <group position={[-.74,.13,.72]}><Plate width={1.22} depth={.54} height={.08} color='#2e413e'/><Parts parts={[-.4,0,.4].map(x=>({position:[x,.09,0] as [number,number,number],size:[.23,.1,.24] as [number,number,number]}))} color='#14242a' metalness={.12}/><Label text='ANALOG FRONT END' width={1.05} position={[0,.15,.18]}/></group>
  <group position={[-1.3,.15,.2]}><Plate width={.75} depth={.7} height={.15} color='#405253'/>{[-.2,0,.2].map(x=><mesh key={x} position={[x,.15,.08]}><cylinderGeometry args={[.068,.068,.08,16]}/><meshStandardMaterial color='#c6c2ac' metalness={.9} roughness={.25}/></mesh>)}<Label text='INPUT' position={[0,.245,-.16]} width={.55}/></group>
  <group position={[-.55,.18,-.28]}><Processor width={.47} active={active}/></group>
  <group position={[.37,.2,.48]}><Processor width={.65} active={active}/></group>
  <group position={[.5,.83,-.48]} rotation={[-.24,0,0]}>
   <RoundedBox castShadow args={[2.05,1.13,.16]} radius={.055} smoothness={2}><meshStandardMaterial color='#77878c' metalness={.91} roughness={.22}/></RoundedBox>
   <mesh position={[0,0,.088]}><planeGeometry args={[1.88,.96]}/><meshPhysicalMaterial color='#06171d' metalness={.05} roughness={.4} clearcoat={.25} clearcoatRoughness={.38}/></mesh>
   <Parts parts={Array.from({length:9},(_,i)=>({position:[(i-4)*.21,0,.091] as [number,number,number],size:[.003,.88,.003] as [number,number,number]}))} color='#203e43' metalness={0}/>
   <Parts parts={Array.from({length:5},(_,i)=>({position:[0,(i-2)*.18,.091] as [number,number,number],size:[1.77,.003,.003] as [number,number,number]}))} color='#203e43' metalness={0}/>
   <Waveform position={[0,.12,.096]} width={1.75} amplitude={.15} noisy color={READ} active={active} reducedMotion={reducedMotion}/>
   <Waveform position={[0,-.19,.096]} width={1.75} amplitude={.11} color={AMBER} active={active} reducedMotion={reducedMotion}/>
   <Label text='SYNTHETIC / SERIAL' position={[0,.37,.097]} rotation={[0,0,0]} width={1.4} color={READ}/>
  </group>
  <SignalTrace active={active} spill={.65} reducedMotion={reducedMotion} points={[[-1.3,.07,.25],[-.95,.07,.25],[-.95,.07,-.28],[-.55,.1,-.28],[-.1,.1,-.28],[-.1,.1,.48],[.37,.1,.48],[1.45,.1,.48],[1.45,.3,-.48],[.5,.4,-.48]]}/>
 </group>;
}

export function OpticalTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
  <group position={[-1.22,.1,0]}><Plate width={.88} depth={1.31} height={.09} color='#6a787b' bolts/></group><group position={[1.08,.1,0]}><Plate width={1.14} depth={1.33} height={.09} color='#697a81' bolts/></group>
  <Parts parts={Array.from({length:8},(_,i)=>({position:[-1.22,.66,(i-3.5)*.105] as [number,number,number],size:[.59,.085,.035] as [number,number,number]}))} color='#788890' metalness={.9} roughness={.3}/>

  <group position={[-1.22,.34,0]}><Plate width={.62} depth={1.04} height={.56} color='#223238'/><group position={[.32,.05,0]} rotation={[0,0,Math.PI/2]}><mesh><cylinderGeometry args={[.2,.2,.045,24]}/><meshPhysicalMaterial color='#e7b65a' emissive={AMBER} emissiveIntensity={active?1.6:.08} metalness={.2} roughness={.12}/></mesh></group><Label text='TX' position={[0,.3,0]} width={.46}/></group>
  <group position={[1.08,.36,0]}><Plate width={.9} depth={1.05} height={.58} color='#42535b'/><group position={[-.56,.07,0]} rotation={[0,0,Math.PI/2]}>
   {[0,.08,.16].map((y,i)=><mesh key={i} position={[0,y,0]}><cylinderGeometry args={[.235-i*.03,.235-i*.03,.07,24]}/><meshStandardMaterial color={i===1?'#8c9ba3':'#17272d'} metalness={.92} roughness={.19}/></mesh>)}
   <mesh position={[0,.21,0]}><cylinderGeometry args={[.16,.16,.012,24]}/><meshPhysicalMaterial color='#426f84' metalness={.55} roughness={.08} clearcoat={1}/></mesh>
  </group><group position={[.12,.38,0]}><Processor width={.46} active={active}/></group><Label text='RX / CAMERA' position={[0,.3,.36]} width={.76}/></group>
  <SignalTrace color='#ffdb9e' active={active} spill={.75} reducedMotion={reducedMotion} strength={.7} speed={.12} points={[[-.86,.39,0],[.35,.39,0]]}/>
  <SignalTrace color={READ} active={active} reducedMotion={reducedMotion} strength={.65} points={[[1.18,.09,.48],[1.18,.09,.86],[.2,.09,.86],[.2,.09,1.15]]}/>
  <group position={[-1.45,.13,.84]}><Connector width={.55} count={8}/></group>
 </group>;
}

export function InstrumentTile({active=true}:{active?:boolean}) {
 return <group>
  <Frame width={1.24} depth={1.58} height={.14}/><group position={[0,.17,-.25]}><Plate width={1.05} depth={.88} height={.25} color='#6b7a7c'/></group>
  {[-.37,-.12,.12,.37].map((x,i)=><group key={x}><group position={[x,.4,-.25]}><Plate width={.16} depth={.66} height={.08} color='#1f383b'/></group><mesh position={[x,.26,.44]}><cylinderGeometry args={[.064,.064,.25,12]}/><meshStandardMaterial color='#b9b49e' metalness={.87} roughness={.24}/></mesh><Label text={`CH${i}`} position={[x,.451,-.24]} width={.13} color={active?AMBER:READ}/></group>)}
 </group>;
}

export function SiliconDie({width=1}:{width?:number}) {
 const texture=useResource('etched-silicon-die',()=>canvasTexture(x=>{
  x.fillStyle='#13262e';x.fillRect(0,0,512,512);
  x.strokeStyle='#738783';x.lineWidth=1;x.strokeRect(9,9,494,494);
  // Abstract logic islands and SRAM-like banks; no proprietary die architecture.
  for(let row=0;row<12;row++)for(let col=0;col<10;col++){
   const px=22+col*29,py=22+row*38;x.fillStyle=(row+col)%4===0?'#42616a':'#29434a';x.fillRect(px,py,25,32);
   for(let k=0;k<7;k++){x.fillStyle=k%2?'#7a89705a':'#162d35';x.fillRect(px+2,py+3+k*4,20,1);}
   x.fillStyle='#a0aa783d';x.fillRect(px+9,py,1,32);
  }
  for(let bank=0;bank<4;bank++){const py=23+bank*116;x.fillStyle='#42636a';x.fillRect(335,py,151,102);for(let n=0;n<23;n++){x.fillStyle=n%3===0?'#8a9677':'#1d3940';x.fillRect(340,py+3+n*4,142,1);}for(let n=0;n<12;n++){x.fillStyle='#73837360';x.fillRect(341+n*12,py+2,1,98);}}
  for(let n=0;n<20;n++){x.strokeStyle=n%4===0?'#ada676':'#597d7c';x.lineWidth=n%4===0?1:.5;x.beginPath();x.moveTo(14+n*15,16);x.lineTo(14+n*15,491);x.lineTo(327+n*7,491);x.stroke();}
  for(let n=0;n<34;n++){x.fillStyle='#c1b075';x.fillRect(17+n*14,4,5,4);x.fillRect(17+n*14,504,5,4);x.fillRect(4,17+n*14,4,5);x.fillRect(504,17+n*14,4,5);}
 },512,true));
 return <mesh castShadow rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width,width]}/><meshPhysicalMaterial map={texture} metalness={.72} roughness={.19} clearcoat={.85} clearcoatRoughness={.12}/></mesh>;
}
