import {useLayoutEffect,useRef} from 'react';
import {RoundedBox} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {CylinderGeometry,InstancedMesh,Matrix4,MeshStandardMaterial} from 'three';
import {Plate,Label,AMBER,READ} from './Hardware';
import {Parts,Processor,Connector,CircuitBoard} from './Circuitry';
import {useMetal,useResource,canvasTexture} from './resources';
import {useDetailTier} from './quality';
import SignalTrace from './SignalTrace';
import Waveform from './Waveform';
import {useMicroSequence} from './useMicroSequence';

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
 const geometry=useResource(`capacitor:${cap}`,()=>new CylinderGeometry(cap?.061:.067,cap?.061:.067,cap?.016:.19,12));
 useLayoutEffect(()=>{const m=new Matrix4();for(let i=0;i<count;i++)ref.current?.setMatrixAt(i,m.makeTranslation(0,cap?.1:0,(i-(count-1)/2)*.19));if(ref.current)ref.current.instanceMatrix.needsUpdate=true;},[count,cap]);
 return <instancedMesh ref={ref} args={[geometry,material,count]} dispose={null} raycast={()=>{}}/>;
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
  <Parts parts={[-1,1].map(s=>({position:[s*.66,.17,1.02] as [number,number,number],size:[.85,.13,.2] as [number,number,number]}))} color='#172b32' metalness={.12} roughness={.62}/>
  {[-1,1].map(s=><group key={s}><Label text={s<0?'WR CONTROL':'RD CONTROL'} position={[s*.66,.242,1.02]} width={.65} color={s<0?AMBER:READ}/><group position={[s*1.21,.13,1.01]}><Connector width={.25} count={4}/></group></group>)}
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:12},(_,i)=>({position:[s*.66+(i-5.5)*.052,.095,.91] as [number,number,number],size:[.023,.032,.16] as [number,number,number]})))} color='#b9a778' metalness={.9}/>
  {[['EMPTY',occupied.every(on=>!on),-.55],['FULL',occupied.every(Boolean),.55]].map(([name,on,x])=><group key={String(name)}><Parts parts={[{position:[Number(x),.14,-.95],size:[.085,.03,.09]}]} color={on?AMBER:'#233b42'} emissive={Boolean(on)}/><Label text={String(name)} position={[Number(x),.167,-1.04]} width={.43} color={on?AMBER:READ}/></group>)}
 </group>;
}

export function ArithmeticTile({a=0,b=0,result=0,switches=21,subtract=false,reducedMotion,active=true,scale=1}:{a?:number;b?:number;result?:number;switches?:number;subtract?:boolean;reducedMotion:boolean;active?:boolean;scale?:number}) {
 const sequence=useMicroSequence(active,reducedMotion,5,3.5,'fpga',`${a}:${b}:${result}:${switches}:${subtract}`,{loop:true,pause:2.2}),stage=sequence.stage;
 return <group scale={scale}>
  {sequence.running&&<pointLight position={[.35,1.1,.72]} color='#ffe0b4' intensity={1.7} distance={2.9} decay={2}/>}
  <Frame width={3.6} depth={2.45} height={.13}/>
  <group position={[-1.43,.18,0]}>
   <Plate width={.48} depth={1.65} height={.13} color='#682b20'/>
   <Parts parts={Array.from({length:8},(_,i)=>({position:[0,.11,(i-3.5)*.18] as [number,number,number],size:[.32,.12,.13] as [number,number,number]}))} color='#0e171a' metalness={.02} roughness={.7}/>
   <Parts parts={Array.from({length:8},(_,i)=>({position:[(switches>>i)&1?.08:-.08,.18,(i-3.5)*.18] as [number,number,number],size:[.09,.028,.065] as [number,number,number]}))} color={stage===0?AMBER:'#c6cace'} metalness={.3}/>
  </group>
  {[-1,1].map((s,i)=><group key={s} position={[-.62,.17,s*.62]}><Plate width={.65} depth={.62} height={.14} color='#202c2d'/><Parts parts={Array.from({length:8},(_,n)=>({position:[(n-3.5)*.071,.1,.22] as [number,number,number],size:[.034,.045,.09] as [number,number,number]}))} color='#c0af7c'/><Label text={`${i===0?'A':'B'} ${i===0?a:b}`} position={[0,.081,0]} width={.48} color={stage===i+1?AMBER:READ}/></group>)}
  <group position={[.38,.22,0]}><Processor width={.95} active={sequence.running&&stage===3}/><Label text={subtract?'SUB / 8-BIT':'ADD / 8-BIT'} position={[0,.31,0]} width={.75}/></group>
  <Parts parts={Array.from({length:5},(_,i)=>({position:[(i-2)*.42,.13,.98] as [number,number,number],size:[.3,.12,.28] as [number,number,number]}))} color='#6e7d83' metalness={.88} roughness={.27} beveled/>
  <Parts parts={Array.from({length:5},(_,i)=>({position:[(i-2)*.42,.216,.98] as [number,number,number],size:[.18,.075,.18] as [number,number,number]}))} color='#17292e' metalness={.03} roughness={.72} beveled/>
  {['LOAD A','LOAD B','ADD','SUB','CLEAR'].map((name,i)=><Label key={name} text={name} position={[(i-2)*.42,.257,.98]} width={.24}/>)}
  <Parts parts={[-.1,.1].flatMap(x=>[-.11,.11].map(z=>({position:[-.66+x,.21,z] as [number,number,number],size:[.12,.09,.16] as [number,number,number]})))} color='#273b43' metalness={.16}/>
  <Label text='2FF / SYNC' position={[-.66,.27,0]} width={.42} color={READ}/>
  <SignalTrace active={sequence.running&&stage===0} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.55} color={READ} points={[[.84,.1,.98],[-.94,.1,.98],[-.94,.1,0],[-.66,.14,0],[-.66,.14,-.62]]}/>
  <group position={[1.4,.2,0]}><Plate width={.36} depth={1.78} height={.1} color='#4d5f63'/>{Array.from({length:8},(_,i)=><mesh key={i} position={[0,.095,(i-3.5)*.2]}><sphereGeometry args={[.062,12,8]}/><meshStandardMaterial color={(result>>i)&1?AMBER:'#203333'} emissive={AMBER} emissiveIntensity={(result>>i)&1?(stage===4?2.2:.15):0} roughness={.25}/></mesh>)}</group>
  <Label text='SW[7:0]' position={[-1.43,.275,-1]} width={.46}/><Label text='LED[7:0]' position={[1.4,.28,-1]} width={.56}/>
  {[-1,1].map(s=><SignalTrace key={s} active={sequence.running&&stage>0} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.8} points={[[-1.45,.09,s*.62],[-.62,.09,s*.62],[-.18,.09,s*.62],[-.18,.09,0],[.38,.11,0],[1.4,.11,0]]}/>)}
 </group>;
}

export function AcquisitionTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 const sequence=useMicroSequence(active,reducedMotion,5,3.8,'emg',undefined,{loop:true,pause:2.6}),stage=sequence.stage;
 return <group scale={scale}>
  <Parts parts={[-1,1].map(s=>({position:[.5+s*.7,.38,-.51] as [number,number,number],size:[.1,.65,.12] as [number,number,number]}))} color='#788b94' metalness={.9} roughness={.28}/>
  <Parts parts={[-1,1].map(s=>({position:[.5+s*.7,.12,-.48] as [number,number,number],size:[.28,.055,.55] as [number,number,number]}))} color='#667980'/>
  <group position={[-.74,.13,.72]}><Plate width={1.22} depth={.54} height={.08} color='#2e413e'/><Parts parts={[-.4,0,.4].map(x=>({position:[x,.09,0] as [number,number,number],size:[.23,.1,.24] as [number,number,number]}))} color='#14242a' metalness={.12}/><Label text='ANALOG FRONT END' width={1.05} position={[0,.15,.18]}/></group>
  <group position={[-1.3,.15,.2]}><Plate width={.75} depth={.7} height={.15} color='#405253'/>{[-.2,0,.2].map(x=><mesh key={x} position={[x,.15,.08]}><cylinderGeometry args={[.068,.068,.08,16]}/><meshStandardMaterial color='#c6c2ac' metalness={.9} roughness={.25}/></mesh>)}<Label text='MYOWARE / INPUT' position={[0,.245,-.16]} width={.67}/></group>
  <group position={[-.55,.08,-.28]}><CircuitBoard width={.85} depth={.83} seed={121}/><Connector width={.55} count={6}/></group>
  <group position={[-.55,.18,-.28]}><Processor width={.47} active={sequence.running&&stage===1}/><Label text='MCU / ADC' position={[0,.29,0]} width={.44}/></group>
  <group position={[.37,.08,.48]}><Plate width={1.06} depth={.69} height={.13} color='#26383e' rim/><Parts parts={[-1,1].map(s=>({position:[s*.43,.12,0] as [number,number,number],size:[.1,.08,.45] as [number,number,number]}))} color='#697e84'/></group>
  <group position={[.37,.2,.48]}><Processor width={.65} active={sequence.running&&stage===3}/><Label text='PYTHON' position={[0,.28,0]} width={.5}/></group>
  <group position={[-.67,.17,-.87]}><Connector width={.7} count={6}/><Label text='SERIAL' position={[0,.14,.17]} width={.57} color={READ}/></group>
  <Label text='ADC → SERIAL → PYTHON' position={[0,.12,1.08]} width={1.8} color={READ}/>
  <SignalTrace color={READ} active={sequence.running&&stage===2} progressRef={sequence.progress} reducedMotion={reducedMotion} strength={.55} points={[[-.55,.13,-.28],[-.55,.13,-.82],[-.08,.13,-.82],[-.08,.13,.48],[.37,.13,.48]]}/>
  <group position={[.5,.83,-.48]} rotation={[-.24,0,0]}>
   <RoundedBox castShadow args={[2.05,1.13,.16]} radius={.055} smoothness={2}><meshStandardMaterial color='#77878c' metalness={.91} roughness={.22}/></RoundedBox>
   <mesh position={[0,0,.088]}><planeGeometry args={[1.88,.96]}/><meshPhysicalMaterial color='#06171d' metalness={.05} roughness={.4} clearcoat={.25} clearcoatRoughness={.38}/></mesh>
   <Parts parts={Array.from({length:9},(_,i)=>({position:[(i-4)*.21,0,.091] as [number,number,number],size:[.003,.88,.003] as [number,number,number]}))} color='#203e43' metalness={0}/>
   <Parts parts={Array.from({length:5},(_,i)=>({position:[0,(i-2)*.18,.091] as [number,number,number],size:[1.77,.003,.003] as [number,number,number]}))} color='#203e43' metalness={0}/>
   <Waveform position={[0,.12,.096]} width={1.75} amplitude={.15} noisy color={READ} active={sequence.running&&stage===4} reducedMotion={reducedMotion}/>
   <Waveform position={[0,-.19,.096]} width={1.75} amplitude={.11} color={AMBER} active={sequence.running&&stage===4} reducedMotion={reducedMotion}/>
   <Parts parts={[-.65,-.5,-.35].map(x=>({position:[x,-.49,.098] as [number,number,number],size:[.045,.02,.015] as [number,number,number]}))} color={AMBER} emissive/>
   <Label text='SYNTHETIC / SERIAL' position={[0,.37,.097]} rotation={[0,0,0]} width={1.4} color={READ}/>
  </group>
  <SignalTrace active={sequence.running} progressRef={sequence.progress} spill={.65} reducedMotion={reducedMotion} points={[[-1.3,.07,.25],[-.95,.07,.25],[-.95,.07,-.28],[-.55,.1,-.28],[-.1,.1,-.28],[-.1,.1,.48],[.37,.1,.48],[1.45,.1,.48],[1.45,.3,-.48],[.5,.4,-.48]]}/>
 </group>;
}

export function OpticalTile({reducedMotion,active=true,scale=1}:{reducedMotion:boolean;active?:boolean;scale?:number}) {
 const sequence=useMicroSequence(active,reducedMotion,4,3.6,'lumalink');
 const screen=useRef<MeshStandardMaterial>(null),exposure=useRef<MeshStandardMaterial>(null),decode=useRef<MeshStandardMaterial>(null),clock=useRef(0),propagation=useRef(.3),received=useRef(.3);
 useFrame(()=>{
  clock.current=sequence.progress.current*3.6;
  const t=clock.current,pulse=(n:number)=>n>=0&&[[0,.18],[.36,.54],[.72,1.2]].some(([a,b])=>n>=a&&n<b);
  const transmitting=sequence.running&&(reducedMotion||pulse(t)),capturing=sequence.running&&(reducedMotion||pulse(t-.2)),decoded=sequence.running&&(reducedMotion||t>1.5&&t<3.9);
  propagation.current=transmitting||capturing?1:.05;received.current=decoded?.75:.05;
  if(screen.current)screen.current.emissiveIntensity=transmitting?1.7:.045;
  if(exposure.current)exposure.current.emissiveIntensity=capturing?1.8:.03;
  if(decode.current)decode.current.emissiveIntensity=decoded?1.15:.025;
 });
 return <group scale={scale}>
  <group position={[-1.22,.1,0]}><Plate width={.88} depth={1.31} height={.09} color='#6a787b' bolts/></group><group position={[1.08,.1,0]}><Plate width={1.14} depth={1.33} height={.09} color='#697a81' bolts/></group>
  <Parts parts={[-1,1].map(s=>({position:[-1.27,.28,s*.46] as [number,number,number],size:[.12,.35,.1] as [number,number,number]}))} color='#85959b' roughness={.27}/>
  <group position={[-1.27,.66,0]}>
   <RoundedBox args={[.105,.88,1.22]} radius={.035} smoothness={1}><meshStandardMaterial color='#60757d' metalness={.92} roughness={.25}/></RoundedBox>
   <mesh position={[.055,0,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.13,.79]}/><meshStandardMaterial color='#08151b' roughness={.38}/></mesh>
   <mesh position={[.057,0,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.04,.68]}/><meshStandardMaterial ref={screen} color='#c1a878' emissive='#ffd89e' emissiveIntensity={.045} roughness={.26} metalness={.08}/></mesh>
   <Label text='SCREEN / MORSE TX' position={[.062,-.35,0]} rotation={[0,Math.PI/2,0]} width={1.03}/>
  </group>
  <group position={[-1.22,.17,.36]}><CircuitBoard width={.69} depth={.34} seed={127}/><Processor width={.23}/></group>
  <Label text='TX / SCREEN' position={[-1.22,.158,.55]} width={.77}/>
  <group position={[1.08,.16,.49]}><CircuitBoard width={.94} depth={.38} seed={129}/><Connector width={.62} count={6}/></group>
  <Parts parts={Array.from({length:6},(_,i)=>({position:[1.15+(i-2.5)*.1,.78,-.25] as [number,number,number],size:[.035,.07,.36] as [number,number,number]}))} color='#7d9199' metalness={.86} roughness={.32}/>
  <group position={[1.08,.36,0]}><Plate width={.9} depth={1.05} height={.58} color='#42535b'/><group position={[-.56,.07,0]} rotation={[0,0,Math.PI/2]}>
   {[0,.08,.16].map((y,i)=><mesh key={i} position={[0,y,0]}><cylinderGeometry args={[.235-i*.03,.235-i*.03,.07,24]}/><meshStandardMaterial color={i===1?'#8c9ba3':'#17272d'} metalness={.92} roughness={.19}/></mesh>)}
   <mesh position={[0,.21,0]}><cylinderGeometry args={[.16,.16,.012,24]}/><meshPhysicalMaterial color='#426f84' metalness={.55} roughness={.08} clearcoat={1}/></mesh>
  </group><mesh position={[-.13,.32,.4]}><boxGeometry args={[.1,.035,.045]}/><meshStandardMaterial ref={exposure} color={READ} emissive={READ} roughness={.25}/></mesh><group position={[.12,.38,0]}><Processor width={.46} active={false}/></group><Label text='RX / CAMERA' position={[0,.3,.36]} width={.76}/></group>
  <SignalTrace color='#ffdb9e' active={sequence.running} activityRef={propagation} spill={.55} reducedMotion={reducedMotion} strength={.6} speed={1.1} points={[[-1.2,.65,0],[.35,.43,0]]}/>
  <SignalTrace color={READ} active={sequence.running} activityRef={received} reducedMotion={reducedMotion} strength={.65} points={[[1.18,.09,.48],[1.18,.09,.86],[.2,.09,.86],[.2,.09,1.15]]}/>
  <group position={[.15,.19,.97]}><Plate width={.85} depth={.34} height={.12} color='#283a41'/><mesh position={[.29,.078,0]}><boxGeometry args={[.12,.027,.12]}/><meshStandardMaterial ref={decode} color={AMBER} emissive={AMBER}/></mesh><Label text='DECODE' position={[-.09,.084,0]} width={.49}/></group>
  <group position={[-1.45,.13,.84]}><Connector width={.55} count={8}/></group>
 </group>;
}

export function InstrumentTile({active=true,reducedMotion=false}:{active?:boolean;reducedMotion?:boolean}) {
 const sequence=useMicroSequence(active,reducedMotion,5,3.2,'daq');
 return <group>
  <Frame width={1.24} depth={1.58} height={.14}/><group position={[0,.17,-.25]}><Plate width={1.05} depth={.88} height={.25} color='#6b7a7c'/></group>
  {[-.37,-.12,.12,.37].map((x,i)=><group key={x}><group position={[x,.4,-.25]}><Plate width={.16} depth={.66} height={.08} color='#1f383b'/></group><mesh position={[x,.26,.44]}><cylinderGeometry args={[.064,.064,.25,12]}/><meshStandardMaterial color='#b9b49e' metalness={.87} roughness={.24}/></mesh><Label text={`CH${i}${sequence.stage===i?" / ↑":""}`} position={[x,.451,-.24]} width={.13} color={sequence.stage===i?AMBER:READ}/></group>)}
  <Parts parts={[-.37,-.12,.12,.37].map(x=>({position:[x,.457,.12] as [number,number,number],size:[.05,.022,.075] as [number,number,number]}))} color={sequence.running?AMBER:'#34474b'} emissive={sequence.running}/>
  <group position={[0,.48,-.65]} rotation={[-.25,0,0]}><Plate width={1.08} depth={.12} height={.38} color='#75868d'/><mesh position={[0,0,.065]}><planeGeometry args={[.96,.28]}/><meshStandardMaterial color='#09222a' metalness={.05} roughness={.4}/></mesh><Label text={sequence.running?`CH ${Math.min(3,sequence.stage)} / SAMPLE`:'4 CH / LOG'} position={[0,.04,.067]} rotation={[0,0,0]} width={.8} color={READ}/><Parts parts={Array.from({length:4},(_,i)=>({position:[(i-1.5)*.2,-.075,.067] as [number,number,number],size:[.14,.018,.005] as [number,number,number]}))} color='#7b9ca1'/></group>
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
