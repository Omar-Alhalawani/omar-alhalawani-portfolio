import {useMemo} from 'react';
import {Parts,Connector,CircuitBoard,Processor,ViaField} from './Circuitry';
import {Plate,Label} from './Hardware';
import {SiliconDie,Frame,PowerBank} from './ModuleHardware';
import type {GraphicsTier} from './types';

export function ComputePackage({tier}:{tier:GraphicsTier}) {
 const contacts=useMemo(()=>[-1,1].flatMap(s=>Array.from({length:tier==='low'?18:36},(_,i)=>{const n=tier==='low'?18:36,p=(i-(n-1)/2)*2.3/n;return [{position:[p,.1,s*1.13] as [number,number,number],size:[.025,.035,.21] as [number,number,number]},{position:[s*1.31,.1,p*.82] as [number,number,number],size:[.21,.035,.025] as [number,number,number]}];}).flat()),[tier]);
 return <group>
  <Plate width={3.03} depth={2.61} height={.11} color='#1c302b' rim/>
  <Parts parts={contacts} color='#bfa363' metalness={.96} roughness={.25}/>
  <group position={[0,.13,0]}><Plate width={2.46} depth={2.12} height={.16} color='#151c22' metalness={.12} roughness={.57}/><Frame width={2.67} depth={2.34} height={.28}/></group>
  <group position={[0,.25,0]}><Plate width={1.78} depth={1.66} height={.055} color='#7d8b8e'/></group>
  <group position={[0,.286,0]}><SiliconDie width={1.45}/></group>
  <ViaField positions={[-1,1].flatMap(s=>Array.from({length:28},(_,i)=>[(i-13.5)*.092,.062,s*1.235] as [number,number,number]))}/>
  <Parts parts={[-1,1].flatMap(x=>[-1,1].map(z=>({position:[x*1.18,.307,z*1.01] as [number,number,number],size:[.2,.09,.15] as [number,number,number]})))} color='#92a1a5' metalness={.96} roughness={.23} beveled/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:6},(_,i)=>({position:[s*.84,.288,(i-2.5)*.23] as [number,number,number],size:[.075,.032,.11] as [number,number,number]})))} color='#bdb39b' metalness={.45} roughness={.45}/>
  <Parts parts={[-1,1].map(s=>({position:[s*1.36,.2,0] as [number,number,number],size:[.016,.035,2.11] as [number,number,number]}))} color='#ffbd59' emissive/>
  <Parts parts={[-1,1].flatMap(s=>[-.66,-.22,.22,.66].map(z=>({position:[s*1,.27,z] as [number,number,number],size:[.3,.065,.3] as [number,number,number]})))} color='#29444b' metalness={.7} roughness={.22}/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:tier==='low'?8:18},(_,n)=>({position:[(n-(tier==='low'?7:17)/2)*1.65/(tier==='low'?8:18),.23,s*.98] as [number,number,number],size:[.035,.04,.1] as [number,number,number]})))} color='#839188' roughness={.35}/>
  <Label text='OA / CONCEPTUAL COMPUTE' width={1.62} position={[0,.3,1.05]} color='#c9cbbd'/>
 </group>;
}

export function PortBank({width=3.8,count=5}:{width?:number;count?:number}) {
 const bodies=useMemo(()=>Array.from({length:count},(_,i)=>({position:[(i-(count-1)/2)*width/count,.16,0] as [number,number,number],size:[width/count*.8,.29,.37] as [number,number,number]})),[width,count]);
 return <group><Parts parts={bodies} color='#899297' metalness={.92} roughness={.27} beveled/><Parts parts={bodies.map(p=>({position:[p.position[0],.16,.192],size:[p.size[0]*.78,.17,.025]}))} color='#0b1418' metalness={.05} roughness={.7}/><Parts parts={bodies.flatMap(p=>Array.from({length:6},(_,n)=>({position:[p.position[0]+(n-2.5)*p.size[0]/9,.097,.209] as [number,number,number],size:[.021,.044,.038] as [number,number,number]})))} color='#bfa56b' roughness={.27}/><Parts parts={bodies.flatMap(p=>[-1,1].map(s=>({position:[p.position[0]+s*p.size[0]*.43,.145,.211] as [number,number,number],size:[.035,.2,.027] as [number,number,number]})))} color='#b5bec0' metalness={.94} roughness={.2}/><Parts parts={bodies.flatMap(p=>[-1,1].map(s=>({position:[p.position[0]+s*p.size[0]*.26,.31,.05] as [number,number,number],size:[.055,.008,.19] as [number,number,number]})))} color='#293f49' metalness={.4} roughness={.53}/></group>;
}

export function PowerShelf({tier,scale=1}:{tier:GraphicsTier;scale?:number}) {
 return <group scale={scale}>
  <CircuitBoard width={4.5} depth={.92} seed={159} tier={tier}/>
  <group position={[-1.89,.17,0]}><PowerBank count={4}/></group><group position={[1.89,.17,0]}><PowerBank count={4}/></group>
  <Parts parts={Array.from({length:10},(_,i)=>({position:[(i-4.5)*.28,.17,0] as [number,number,number],size:[.18,.17,.28] as [number,number,number]}))} color='#26383c' metalness={.25} roughness={.6}/>
  <Parts parts={Array.from({length:10},(_,i)=>({position:[(i-4.5)*.28,.264,0] as [number,number,number],size:[.13,.018,.19] as [number,number,number]}))} color='#8a958c' roughness={.35}/>
  <Parts parts={[-1,1].flatMap(s=>Array.from({length:10},(_,i)=>({position:[(i-4.5)*.28,.105,s*.31] as [number,number,number],size:[.16,.065,.095] as [number,number,number]})))} color='#15262c' metalness={.08} roughness={.65}/>
  <Parts parts={[-1,1].map(s=>({position:[0,.065,s*.39] as [number,number,number],size:[3.15,.018,.045] as [number,number,number]}))} color='#b19a62' metalness={.91} roughness={.28}/>
 </group>;
}

export function SideCar({tier}:{tier:GraphicsTier}) {
 return <group><CircuitBoard width={.84} depth={2.5} tier={tier} seed={165}/>{[-.72,.72].map(z=><group key={z} position={[0,.07,z]}><Processor width={.46} active={false}/></group>)}<group position={[0,.12,1.2]}><Connector width={.7} count={10}/></group></group>;
}
