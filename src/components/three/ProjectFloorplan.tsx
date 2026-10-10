import {useEffect,useRef,useState} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {Group,MathUtils,Vector3} from 'three';
import {Board,Block} from './Board';
import {Plate,Chip,Label,AMBER,READ} from './Hardware';
import SignalTrace from './SignalTrace';
import Waveform from './Waveform';
import {Printer} from './projects/CubexScene';
import {selectProject} from '../../lib/project-selection';
import type {SceneProps} from './types';

const regions=[
  {id:'fifo',label:'FIFO',x:-1.65,z:-1}, {id:'fpga-arithmetic',label:'FPGA',x:0,z:-1}, {id:'lumalink',label:'LUMALINK',x:1.65,z:1},
  {id:'emg',label:'EMG',x:-1.65,z:1}, {id:'mini-lysimeter',label:'DAQ',x:0,z:1}, {id:'cubex',label:'CUBEX',x:1.65,z:-1},
];
export default function ProjectFloorplan({reducedMotion,tier}:SceneProps) {
  const [active,setActive]=useState('fifo'),[opening,setOpening]=useState<string|null>(null);
  const groups=useRef<(Group|null)[]>([]),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const down=useRef<{x:number;y:number;id:string;time:number}|null>(null),lastTouch=useRef<string|null>(null),time=useRef(0);
  const {invalidate,camera,size,gl}=useThree();
  const fit=Math.max(1,1.16/(size.width/size.height));
  const base=useRef(new Vector3(0,5.8*fit,6.8*fit));
  useEffect(()=>{base.current.set(0,5.8*fit,6.8*fit);camera.position.copy(base.current);camera.lookAt(0,.18,0);invalidate();},[camera,fit,invalidate]);
  useEffect(()=>{
    const read=(event:Event)=>{const id=(event as CustomEvent<string>).detail;if(regions.some(r=>r.id===id)){setActive(id);invalidate();}};
    const selected=document.querySelector<HTMLElement>('[data-project-world]')?.dataset.selected;
    if(selected)setActive(selected);
    window.addEventListener('portfolio:project',read);
    return()=>{window.removeEventListener('portfolio:project',read);if(timer.current)clearTimeout(timer.current);gl.domElement.style.cursor='';};
  },[invalidate,gl]);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.05);if(!reducedMotion)time.current+=dt;
    groups.current.forEach((group,i)=>{if(group)group.position.y=MathUtils.damp(group.position.y,regions[i].id===active?.15:.035,6,dt);});
    const region=regions.find(r=>r.id===opening);
    const target=region&&!reducedMotion?new Vector3(region.x*.27,base.current.y*.86,base.current.z*.86):base.current;
    camera.position.lerp(target,1-Math.exp(-dt*8));camera.lookAt(0,.18,0);
    gl.domElement.dataset.selectedProject=active;
    gl.domElement.dataset.transition=opening||'idle';
    if(Math.floor(time.current*10)%5===0){
      gl.domElement.dataset.projectTargets=JSON.stringify(regions.map((r,i)=>{
        const p=new Vector3(0,.16,-.05);groups.current[i]?.localToWorld(p);p.project(camera);
        return {id:r.id,x:(p.x+1)*size.width/2,y:(1-p.y)*size.height/2};
      }));
    }
  });
  const open=(id:string)=>{
    if(timer.current)return;
    selectProject(id);setOpening(id);
    timer.current=setTimeout(()=>{window.location.assign(`/projects/${id}`);},reducedMotion?0:320);
  };
  const start=(event:ThreeEvent<PointerEvent>,id:string)=>{if(event.button!==0)return;event.stopPropagation();down.current={x:event.clientX,y:event.clientY,id,time:performance.now()};};
  const end=(event:ThreeEvent<PointerEvent>,id:string)=>{
    event.stopPropagation();const gesture=down.current;down.current=null;
    if(!gesture||gesture.id!==id||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>8||performance.now()-gesture.time>700)return;
    if(event.pointerType==='mouse')open(id);
    else if(lastTouch.current===id&&active===id)open(id);
    else{lastTouch.current=id;selectProject(id);}
  };
  return <group rotation={[0,-.1,0]}>
    <Board width={5.5} depth={4.1} height={.18}/>
    {regions.map((region,i)=>{
      const selected=region.id===active;
      return <group key={region.id} ref={g=>{groups.current[i]=g;}} position={[region.x,.035,region.z]}
        onPointerOver={event=>{event.stopPropagation();if(event.pointerType==='mouse'){selectProject(region.id);gl.domElement.style.cursor='pointer';}}}
        onPointerOut={()=>{gl.domElement.style.cursor='';}}
        onPointerDown={event=>start(event,region.id)} onPointerUp={event=>end(event,region.id)} onPointerCancel={()=>{down.current=null;}}>
        <Plate width={1.4} depth={1.53} height={.11} color={selected?'#3f3b33':'#282d31'} rim bolts={tier!=='low'}/>
        <Label text={region.label} position={[0,.063,.59]} width={.9} color={selected?AMBER:'#9ca5aa'}/>
        {region.id==='fifo'&&<group position={[0,.15,-.08]}>
          <Plate width={1.05} depth={.75} height={.08} color="#111619"/>
          {Array.from({length:8},(_,n)=><Block key={n} position={[(n%4-1.5)*.23,.13,(Math.floor(n/4)-.5)*.34]} size={[.14,.2,.23]} active={selected&&n<5}/>)}
        </group>}
        {region.id==='fpga-arithmetic'&&<>
          <group position={[-.35,.2,-.27]}><Chip width={.31} depth={.28} active={selected}/></group><group position={[-.35,.2,.14]}><Chip width={.31} depth={.28} active={selected}/></group>
          <group position={[.23,.24,-.08]}><Chip width={.54} depth={.58} active={selected}/></group>
          <SignalTrace reducedMotion={reducedMotion} active={selected} points={[[-.2,.12,-.27],[-.07,.12,-.27],[-.07,.12,-.08],[.23,.12,-.08]]}/>
        </>}
        {region.id==='emg'&&<>
          <Block position={[0,.22,-.18]} size={[1.06,.32,.57]}/>
          <group rotation={[-Math.PI/2,0,0]} position={[0,.392,-.18]}><Waveform position={[0,0,0]} width={.9} amplitude={.12} noisy color={READ} active={selected} reducedMotion={reducedMotion}/></group>
          {[-.38,-.19,0,.19,.38].map(x=><mesh key={x} position={[x,.1,.25]}><cylinderGeometry args={[.035,.035,.11,8]}/><meshStandardMaterial color="#a9adaf" metalness={.9} roughness={.3}/></mesh>)}
        </>}
        {region.id==='lumalink'&&<>
          <Block position={[-.4,.23,-.05]} size={[.29,.36,.56]} active={selected}/>
          <Block position={[.39,.23,-.05]} size={[.34,.36,.56]} active={selected}/>
          <mesh position={[.21,.28,-.05]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.11,.11,.12,16]}/><meshStandardMaterial color="#90aeb4" metalness={.9} roughness={.15}/></mesh>
          <SignalTrace reducedMotion={reducedMotion} active={selected} points={[[-.24,.28,-.05],[.16,.28,-.05]]}/>
        </>}
        {region.id==='mini-lysimeter'&&<>
          <Block position={[0,.2,-.12]} size={[1.02,.27,.61]}/>
          {[-.3,0,.3].map(x=><group key={x}><Block position={[x,.38,-.12]} size={[.16,.06,.36]} active={selected}/><mesh position={[x,.22,.29]}><cylinderGeometry args={[.045,.045,.17,8]}/><meshStandardMaterial color="#bdad87" metalness={.85} roughness={.3}/></mesh></group>)}
        </>}
        {region.id==='cubex'&&<group position={[0,.12,-.15]}><Printer reducedMotion={reducedMotion} active={selected} scale={.47}/></group>}
        <SignalTrace reducedMotion={reducedMotion} active={selected} offset={i*.13} points={[[0,.059,-.72],[-.59,.059,-.72],[-.59,.059,.44],[.59,.059,.44],[.59,.059,-.72]]}/>
      </group>;
    })}
    {regions.map((r,i)=><SignalTrace key={r.id} reducedMotion={reducedMotion} active={active===r.id} offset={i*.1} points={[[-2.5,.015,0],[r.x,.015,0],[r.x,.015,r.z*.35],[r.x,.05,r.z*.52]]}/>)}
  </group>;
}
