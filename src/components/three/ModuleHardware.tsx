import {useMemo} from 'react';
import {RoundedBox,Edges} from '@react-three/drei';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {useEffect} from 'react';
import {Plate,Label,AMBER,READ} from './Hardware';
import {Parts,Processor,Connector} from './Circuitry';
import SignalTrace from './SignalTrace';
import Waveform from './Waveform';

// Open manufactured frames preserve the view of the PCB and its internal routes.
export function Frame({width=2.8,depth=2,height=.42}:{width?:number;depth?:number;height?:number}) {
 return <group>
  {[-1,1].map(s=><group key={s}>
   <group position={[s*(width/2-.05),height/2,0]}><Plate width={.1} depth={depth} height={height} color='#334149'/></group>
   <group position={[0,height/2,s*(depth/2-.05)]}><Plate width={width-.18} depth={.1} height={height} color='#26373e'/></group>
  </group>)}
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*(width/2-.13),height*.56,z*(depth/2-.13)] as [number,number,number],size:[.13,height+.07,.13] as [number,number,number]})))} color='#a3afb3' metalness={.92} roughness={.22}/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:12},(_,i)=>({position:[(i-5.5)*(width-.5)/12,height*.53,s*(depth/2+.003)] as [number,number,number],size:[.055,.035,.02] as [number,number,number]})))} color='#131b1e' metalness={.1}/>
 </group>;
}

export function PowerBank({count=6}:{count?:number}) {
 return <group>{Array.from({length:count},(_,i)=><group key={i} position={[0,0,(i-(count-1)/2)*.19]}>
  <mesh castShadow><cylinderGeometry args={[.067,.067,.19,12]}/><meshStandardMaterial color='#141b1e' metalness={.32} roughness={.4}/></mesh>
  <mesh position={[0,.1,0]}><cylinderGeometry args={[.061,.061,.016,12]}/><meshStandardMaterial color='#a9b4b8' metalness={.93} roughness={.22}/></mesh>
  <mesh position={[0,.11,0]}><boxGeometry args={[.07,.007,.008]}/><meshStandardMaterial color='#29373e'/></mesh>
 </group>)}</group>;
}

export function MemoryBank({occupied=Array(8).fill(false),values=[],scale=1}:{occupied?:boolean[];values?:(number|null)[];scale?:number}) {
 return <group scale={scale}>
  <Plate width={2.85} depth={1.65} height={.12} color='#202a2c' rim bolts/>
  <Frame width={2.85} depth={1.65} height={.2}/>
  {[-1,1].map(s=><group key={s} position={[0,.88,s*.7]}><Plate width={2.85} depth={.11} height={.09} color='#52636a' bolts/></group>)}
  {[-1,1].map(s=><group key={s} position={[s*1.29,.94,0]}><Plate width={.2} depth={1.48} height={.055} color='#26383f' bolts/></group>)}
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.32,.46,z*.7] as [number,number,number],size:[.075,.85,.075] as [number,number,number]})))} color='#6f8088' roughness={.23}/>
  {Array.from({length:8},(_,i)=><group key={i} position={[(i%4-1.5)*.62,.42,(Math.floor(i/4)-.5)*.69]}>
   <Plate width={.5} depth={.55} height={.08} color='#697980'/>
   <mesh position={[0,.26,0]}><boxGeometry args={[.38,.49,.42]}/><meshPhysicalMaterial color={occupied[i]?'#b87829':'#596467'} emissive='#ff8d15' emissiveIntensity={occupied[i]?.34:.04} metalness={.1} roughness={.16} transparent opacity={occupied[i]?.34:.14} depthWrite={false}/><Edges color={occupied[i]?'#ffba50':'#aa9066'}/></mesh>
   <mesh position={[0,.25,0]}><boxGeometry args={[.055,.36,.07]}/><meshStandardMaterial color='#ffb958' emissive='#ff8f00' emissiveIntensity={occupied[i]?1.5:.17}/></mesh>
   <Parts parts={[-1,1].flatMap(s=>Array.from({length:5},(_,n)=>({position:[s*.225,.05,(n-2)*.085] as [number,number,number],size:[.055,.045,.025] as [number,number,number]})))} color='#b6a476'/>
   <Label text={occupied[i]&&values[i]!=null?values[i]!.toString(16).toUpperCase().padStart(2,'0'):`0${i}`} position={[0,.34,.218]} rotation={[0,0,0]} width={.26} color={occupied[i]?AMBER:'#9ba7a7'}/>
  </group>)}
  <mesh position={[0,.95,0]}><boxGeometry args={[2.54,.018,1.37]}/><meshPhysicalMaterial color='#b6cbd0' roughness={.09} metalness={.08} transparent opacity={.09} depthWrite={false}/></mesh>
 </group>;
}

export function ArithmeticTile({a=0,b=0,result=0,switches=21,reducedMotion,active=true,scale=1}:{a?:number;b?:number;result?:number;switches?:number;reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
  <Frame width={3.6} depth={2.45} height={.13}/>
  <group position={[-1.43,.18,0]}>
   <Plate width={.48} depth={1.65} height={.13} color='#69747a'/>
   {Array.from({length:8},(_,i)=><group key={i} position={[0,.11,(i-3.5)*.18]}><mesh><boxGeometry args={[.32,.12,.13]}/><meshStandardMaterial color='#0e171a' roughness={.7}/></mesh><mesh position={[(switches>>i)&1?.08:-.08,.07,0]}><boxGeometry args={[.09,.028,.065]}/><meshStandardMaterial color='#c6cace' metalness={.3}/></mesh></group>)}
  </group>
  {[-1,1].map((s,i)=><group key={s} position={[-.62,.17,s*.62]}><Plate width={.65} depth={.62} height={.14} color='#202c2d'/><Parts parts={Array.from({length:8},(_,n)=>({position:[(n-3.5)*.071,.1,.22] as [number,number,number],size:[.034,.045,.09] as [number,number,number]}))} color='#c0af7c'/><Label text={`${i===0?'A':'B'} ${i===0?a:b}`} position={[0,.081,0]} width={.48}/></group>)}
  <group position={[.38,.22,0]}><Processor width={.95} active={active}/><Label text='ALU' position={[0,.31,0]} width={.52}/></group>
  <group position={[-.65,.12,0]}><Parts parts={[-.09,.09].map(x=>({position:[x,.09,0] as [number,number,number],size:[.13,.09,.19] as [number,number,number]}))} color='#66747c'/></group>
  <group position={[1.4,.2,0]}><Plate width={.36} depth={1.78} height={.1} color='#4d5f63'/>{Array.from({length:8},(_,i)=><mesh key={i} position={[0,.095,(i-3.5)*.2]}><boxGeometry args={[.13,.065,.1]}/><meshStandardMaterial color={(result>>i)&1?AMBER:'#203333'} emissive={AMBER} emissiveIntensity={(result>>i)&1?2.2:0} roughness={.25}/></mesh>)}</group>
  {[-1,1].map(s=><SignalTrace key={s} active={active} reducedMotion={reducedMotion} strength={.8} points={[[-1.45,.09,s*.62],[-.62,.09,s*.62],[-.18,.09,s*.62],[-.18,.09,0],[.38,.11,0],[1.4,.11,0]]}/>)}
 </group>;
}

export function AcquisitionTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
  <group position={[-1.3,.15,.2]}><Plate width={.75} depth={.7} height={.15} color='#405253'/>{[-.2,0,.2].map(x=><mesh key={x} position={[x,.15,.08]}><cylinderGeometry args={[.068,.068,.08,16]}/><meshStandardMaterial color='#c6c2ac' metalness={.9} roughness={.25}/></mesh>)}<Label text='INPUT' position={[0,.245,-.16]} width={.55}/></group>
  <group position={[-.55,.18,-.28]}><Processor width={.47} active={active}/></group>
  <group position={[.37,.2,.48]}><Processor width={.65} active={active}/></group>
  <group position={[.5,.83,-.48]} rotation={[-.24,0,0]}>
   <RoundedBox castShadow args={[2.05,1.13,.16]} radius={.055} smoothness={2}><meshStandardMaterial color='#77878c' metalness={.91} roughness={.22}/></RoundedBox>
   <mesh position={[0,0,.088]}><planeGeometry args={[1.88,.96]}/><meshPhysicalMaterial color='#06171d' metalness={.05} roughness={.4} clearcoat={.25} clearcoatRoughness={.38}/></mesh>
   <Parts parts={Array.from({length:9},(_,i)=>({position:[(i-4)*.21,0,.091] as [number,number,number],size:[.003,.88,.003] as [number,number,number]}))} color='#203e43' metalness={0}/>
   <Waveform position={[0,.12,.096]} width={1.75} amplitude={.15} noisy color={READ} active={active} reducedMotion={reducedMotion}/>
   <Waveform position={[0,-.19,.096]} width={1.75} amplitude={.11} color={AMBER} active={active} reducedMotion={reducedMotion}/>
   <Label text='SYNTHETIC / SERIAL' position={[0,.37,.097]} rotation={[0,0,0]} width={1.4} color={READ}/>
  </group>
  <SignalTrace active={active} spill={.65} reducedMotion={reducedMotion} points={[[-1.3,.07,.25],[-.95,.07,.25],[-.95,.07,-.28],[-.55,.1,-.28],[-.1,.1,-.28],[-.1,.1,.48],[.37,.1,.48],[1.45,.1,.48],[1.45,.3,-.48],[.5,.4,-.48]]}/>
 </group>;
}

export function OpticalTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 return <group scale={scale}>
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
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d')!;x.fillStyle='#122532';x.fillRect(0,0,256,256);for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%3===0?'#618387':'#304b58';x.fillRect(i*31+5,j*31+5,25,25);x.strokeStyle='#8c957740';x.strokeRect(i*31+7,j*31+7,21,21);}const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;},[]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh castShadow rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width,width]}/><meshPhysicalMaterial map={texture} metalness={.72} roughness={.19} clearcoat={.85} clearcoatRoughness={.12}/></mesh>;
}
