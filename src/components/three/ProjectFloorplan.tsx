import {useEffect,useRef,useState} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {Group,MathUtils,Vector3} from 'three';
import {Html} from '@react-three/drei';
import {CircuitBoard,Connector,Parts,SystemBed} from './Circuitry';
import {Plate} from './Hardware';
import {Frame,MemoryBank,ArithmeticTile,AcquisitionTile,OpticalTile,InstrumentTile,PowerBank} from './ModuleHardware';
import SignalTrace from './SignalTrace';
import {Printer} from './projects/CubexScene';
import {selectProject} from '../../lib/project-selection';
import type {SceneProps} from './types';

const regions=[
  {id:'fifo',label:'FIFO',x:-.1,z:.72,width:1.94,depth:1.45,lift:.15},
  {id:'fpga-arithmetic',label:'FPGA',x:-1.85,z:-1.03,width:1.68,depth:1.4,lift:.08},
  {id:'lumalink',label:'LUMALINK',x:1.85,z:-.92,width:1.8,depth:1.43,lift:.16},
  {id:'emg',label:'EMG',x:-2.05,z:1.22,width:1.65,depth:1.58,lift:.02},
  {id:'mini-lysimeter',label:'DAQ',x:1.93,z:1.35,width:1.45,depth:1.76,lift:.04},
  {id:'cubex',label:'CUBEX',x:0,z:-1.65,width:1.32,depth:1.42,lift:.04},
];
export default function ProjectFloorplan({reducedMotion,tier}:SceneProps) {
  const [active,setActive]=useState('fifo'),[opening,setOpening]=useState<string|null>(null);
  const groups=useRef<(Group|null)[]>([]),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const down=useRef<{x:number;y:number;id:string;time:number}|null>(null),lastTouch=useRef<string|null>(null),time=useRef(0);
  const {invalidate,camera,size,gl}=useThree();
  const fit=Math.max(1,1.16/(size.width/size.height));
  const base=useRef(new Vector3(0,5.15*fit,5.9*fit));
  useEffect(()=>{gl.domElement.dataset.selectedProject=active;},[active,gl]);
  useEffect(()=>{base.current.set(0,5.15*fit,5.9*fit);camera.position.copy(base.current);camera.lookAt(0,.25,0);invalidate();},[camera,fit,invalidate]);
  useEffect(()=>{
    const read=(event:Event)=>{const id=(event as CustomEvent<string>).detail;if(regions.some(r=>r.id===id)){setActive(id);invalidate();}};
    const selected=document.querySelector<HTMLElement>('[data-project-world]')?.dataset.selected;
    if(selected)setActive(selected);
    window.addEventListener('portfolio:project',read);
    return()=>{window.removeEventListener('portfolio:project',read);if(timer.current)clearTimeout(timer.current);gl.domElement.style.cursor='';};
  },[invalidate,gl]);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.05);if(!reducedMotion)time.current+=dt;
    groups.current.forEach((group,i)=>{if(group){const target=regions[i].lift+(regions[i].id===active?.22:0);group.position.y=reducedMotion?target:MathUtils.damp(group.position.y,target,6,dt);}});
    const region=regions.find(r=>r.id===opening);
    const target=region&&!reducedMotion?new Vector3(region.x*.27,base.current.y*.86,base.current.z*.86):base.current;
    camera.position.lerp(target,1-Math.exp(-dt*8));camera.lookAt(0,.25,0);
    gl.domElement.dataset.selectedProject=active;
    gl.domElement.dataset.transition=opening||'idle';
    if(Math.floor(time.current*10)%5===0){
      gl.domElement.dataset.projectTargets=JSON.stringify(regions.map((r,i)=>{
        const p=new Vector3(0,.36,-.05);groups.current[i]?.localToWorld(p);p.project(camera);
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
  return <group rotation={[0,-.23,0]}>
    <group position={[0,-.37,-.12]}><SystemBed width={8.6} depth={6.6} tier={tier} reducedMotion={reducedMotion}/></group>
    <group position={[0,-.14,0]}><CircuitBoard width={6.5} depth={5.1} tier={tier} seed={56} components={false}/><Frame width={6.5} depth={5.1} height={.13}/></group>
    <group position={[0,-.02,0]}><Plate width={.3} depth={4.75} height={.19} color='#5b6d72'/></group>
    {[-1,1].map(s=><group key={s} position={[s*3.1,.07,-.25]}><PowerBank count={10}/></group>)}
    <Parts parts={[-1,1].flatMap(s=>Array.from({length:15},(_,i)=>({position:[(i-7)*.36,.08,s*2.3] as [number,number,number],size:[.18,.14,.19] as [number,number,number]})))} color='#1b2e34' metalness={.12}/>
    {regions.map((region,i)=>{
      const selected=region.id===active;
      return <group key={region.id} ref={g=>{groups.current[i]=g;}} position={[region.x,region.lift,region.z]}
        onPointerOver={event=>{event.stopPropagation();if(event.pointerType==='mouse'){selectProject(region.id);gl.domElement.style.cursor='pointer';}}}
        onPointerOut={()=>{gl.domElement.style.cursor='';}}
        onPointerDown={event=>start(event,region.id)} onPointerUp={event=>end(event,region.id)} onPointerCancel={()=>{down.current=null;}}>
        <mesh position={[0,.38,0]}><boxGeometry args={[region.width,.85,region.depth]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        <Plate width={region.width} depth={region.depth} height={.12} color={selected?'#687879':'#3a4a50'} rim bolts={tier!=='low'}/>
        <group position={[0,.07,0]}><CircuitBoard width={region.width-.12} depth={region.depth-.12} tier={tier} seed={i+70}/></group>
        <group position={[0,.17,-region.depth/2+.13]}><Connector width={region.width*.5} count={10}/></group>
        <Html position={[0,region.id==='cubex'?1.25:1.02,-region.depth*.4]} center style={{pointerEvents:'none'}}><span aria-hidden="true" style={{display:'block',whiteSpace:'nowrap',padding:'7px 10px',border:`1px solid ${selected?'#c69243':'#6a604c'}`,borderRadius:'4px',background:'#0b1013ed',color:selected?'#ffc36a':'#c0c8c9',font:'10px monospace',letterSpacing:'.04em',boxShadow:selected?'0 0 22px #ffac291c':'none'}}>{region.label}</span></Html>
        {region.id==='fifo'&&<group position={[0,.16,0]}><MemoryBank scale={.6} occupied={selected?[true,true,true,false,false,false,false,false]:[true,false,false,false,false,false,false,false]}/></group>}
        {region.id==='fpga-arithmetic'&&<group position={[0,.17,0]}><ArithmeticTile scale={.43} a={21} b={8} result={29} active={selected} reducedMotion={reducedMotion}/></group>}
        {region.id==='emg'&&<group position={[0,.15,0]}><AcquisitionTile scale={.45} active={selected} reducedMotion={reducedMotion}/></group>}
        {region.id==='lumalink'&&<group position={[0,.14,0]}><OpticalTile scale={.5} active={selected} reducedMotion={reducedMotion}/></group>}
        {region.id==='mini-lysimeter'&&<group position={[0,.15,0]}><InstrumentTile active={selected}/></group>}
        {region.id==='cubex'&&<group position={[0,.12,0]}><Printer reducedMotion={reducedMotion} active={selected} scale={.5}/></group>}
        <SignalTrace strength={selected?1.2:.55} reducedMotion={reducedMotion} active offset={i*.13} points={[[0,.145,-region.depth*.47],[-region.width*.44,.145,-region.depth*.47],[-region.width*.44,.145,region.depth*.4],[region.width*.44,.145,region.depth*.4]]}/>
        <pointLight position={[0,.4,.2]} color='#ffb34d' intensity={selected?1.8:.18} distance={2.1} decay={2}/>
      </group>;
    })}
    {regions.flatMap((r,i)=>[0,1].map(n=><SignalTrace key={`${r.id}-${n}`} spill={active===r.id&&n===0?1.3:0} strength={active===r.id?1.35:.75} reducedMotion={reducedMotion} active offset={i*.13+n*.3} points={[[-3.9,-.25,-2.4+n*.13],[-3.35,-.25,-2.4+n*.13],[-3.35,.07,-2.13+n*.13],[-3.35,.07,n*.13],[r.x,.07,n*.13],[r.x,.07,r.z-r.depth*.48],[r.x,r.lift+.18+(active===r.id?.22:0),r.z-r.depth*.48]]}/>))}
  </group>;
}
