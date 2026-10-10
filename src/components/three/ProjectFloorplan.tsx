import {useEffect,useState} from 'react';
import {useThree} from '@react-three/fiber';
import {Board,Block} from './Board';
import SignalTrace from './SignalTrace';
import Waveform from './Waveform';
import {Printer} from './projects/CubexScene';
import {useSceneCamera} from './useSceneData';
import type {SceneProps} from './types';

const regions=[
  {id:'fifo',x:-1.45,z:-.75}, {id:'fpga-arithmetic',x:0,z:-.75}, {id:'emg',x:1.45,z:-.75},
  {id:'lumalink',x:-1.45,z:.75}, {id:'mini-lysimeter',x:0,z:.75}, {id:'cubex',x:1.45,z:.75},
];
export default function ProjectFloorplan({reducedMotion}:SceneProps) {
  useSceneCamera('floorplan');
  const [active,setActive]=useState('fifo');
  const {invalidate}=useThree();
  useEffect(()=>{
    const read=(event:Event)=>{setActive((event as CustomEvent<string>).detail);invalidate();};
    const selected=document.querySelector<HTMLElement>('[data-project][data-active]')?.dataset.project;
    if(selected)setActive(selected);
    window.addEventListener('portfolio:project',read);return()=>window.removeEventListener('portfolio:project',read);
  },[invalidate]);
  return <group rotation={[0,-.16,0]}>
    <Board width={4.9} depth={3.45}/>
    {regions.map(region=>{
      const selected=region.id===active;
      return <group key={region.id} position={[region.x,selected?.13:.03,region.z]}>
        <Block position={[0,.09,0]} size={[1.15,.18,1.09]} active={selected}/>
        {region.id==='fifo'&&Array.from({length:8},(_,i)=><Block key={i} position={[(i%4-1.5)*.22,.22,(Math.floor(i/4)-.5)*.32]} size={[.14,.07,.2]} active={selected&&i<5}/>)}
        {region.id==='fpga-arithmetic'&&<><Block position={[-.29,.26,-.22]} size={[.25,.14,.24]} active={selected}/><Block position={[-.29,.26,.22]} size={[.25,.14,.24]} active={selected}/><Block position={[.23,.25,0]} size={[.35,.17,.43]} active={selected} color="#b3a1f4"/></>}
        {region.id==='emg'&&<><Waveform position={[0,.38,-.13]} width={.95} amplitude={.16} noisy color="#b3a1f4" active={selected} reducedMotion={reducedMotion}/><Waveform position={[0,.26,.22]} width={.95} amplitude={.12} active={selected} reducedMotion={reducedMotion}/></>}
        {region.id==='lumalink'&&<><Block position={[-.35,.27,0]} size={[.23,.2,.36]} active={selected}/><Block position={[.35,.27,0]} size={[.23,.2,.36]} active={selected} color="#b3a1f4"/><SignalTrace reducedMotion={reducedMotion} active={selected} points={[[-.25,.31,0],[.25,.31,0]]}/></>}
        {region.id==='mini-lysimeter'&&[-.3,0,.3].map(x=><Block key={x} position={[x,.25,0]} size={[.18,.1,.38]} active={selected}/>)}
        {region.id==='cubex'&&<group position={[0,.2,0]}><Printer reducedMotion={reducedMotion} active={selected} scale={.43}/></group>}
      </group>;
    })}
    <SignalTrace reducedMotion={reducedMotion} points={[[-2.15,.02,-1.5],[-2.15,.02,.1],[1.95,.02,.1],[1.95,.02,1.5]]}/>
    <SignalTrace reducedMotion={reducedMotion} active={false} points={[[-.72,.02,-1.5],[-.72,.02,1.5],[.72,.02,1.5],[.72,.02,-1.5]]}/>
  </group>;
}
