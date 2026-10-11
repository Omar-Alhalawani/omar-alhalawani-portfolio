import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {Group,MathUtils,Vector3} from 'three';
import {Html,Line} from '@react-three/drei';
import {CircuitBoard,Connector,Parts,SystemBed} from './Circuitry';
import {Plate} from './Hardware';
import {Frame,MemoryBank,ArithmeticTile,AcquisitionTile,OpticalTile,InstrumentTile,PowerBank} from './ModuleHardware';
import SignalTrace from './SignalTrace';
import {PortBank,PowerShelf} from './EngineeringDetails';
import {Printer} from './projects/CubexScene';
import {setProjectIntent,activeProjectIntent} from '../../lib/project-selection';
import {openProject,projectNavigationHolding,type ProjectOpening} from '../../lib/project-navigation';
import {navigationMark} from '../../lib/navigation-metrics';
import ProjectMount,{type ModelMount} from './ProjectMount';
import type {SceneProps} from './types';

const regions=[
  {id:'fifo',label:'FIFO',x:-.12,z:.90,dockWidth:2.24,dockDepth:1.88,modelScale:.6,restY:-.06},
  {id:'fpga-arithmetic',label:'FPGA',x:-2.25,z:-1.02,dockWidth:1.92,dockDepth:1.66,modelScale:.43,restY:-.06},
  {id:'lumalink',label:'LUMALINK',x:2.33,z:-.85,dockWidth:2.08,dockDepth:1.78,modelScale:.5,restY:-.06},
  {id:'emg',label:'EMG',x:-2.35,z:1.55,dockWidth:1.98,dockDepth:1.94,modelScale:.45,restY:-.06},
  {id:'mini-lysimeter',label:'DAQ',x:2.30,z:1.62,dockWidth:1.72,dockDepth:2.04,modelScale:1,restY:-.06},
  {id:'cubex',label:'CUBEX',x:0,z:-1.90,dockWidth:2.3,dockDepth:1.95,modelScale:.71,restY:-.06},
];
const ACTIVE_LIFT=.22;
const views:Record<string,{scale:number;y:number;yaw:number}>={fifo:{scale:.6/1.15,y:.6,yaw:-.2},'fpga-arithmetic':{scale:.43,y:.42,yaw:-.18},emg:{scale:.45,y:.45,yaw:-.17},lumalink:{scale:.5,y:.5,yaw:-.22},cubex:{scale:.71/1.15,y:.85,yaw:-.27},'mini-lysimeter':{scale:.55,y:.3,yaw:-.12}};
type CameraOpening={request:ProjectOpening;started:number;ready:boolean;complete:boolean;progress:number;from:Vector3;to:Vector3;target:Vector3;midCaptured:boolean};
export default function ProjectFloorplan({reducedMotion,tier}:SceneProps) {
  const [mounts,setMounts]=useState<Record<string,ModelMount>>({});
  const measured=useRef<Record<string,ModelMount>>({});
  const onMeasure=useCallback((id:string,mount:ModelMount)=>{measured.current[id]=mount;setMounts(previous=>({...previous,[id]:mount}));},[]);
  const [physical,setPhysical]=useState<string|null>(null);
  const [active,setActive]=useState('fifo'),[opening,setOpening]=useState<string|null>(null);
  const groups=useRef<(Group|null)[]>([]),transition=useRef<CameraOpening|null>(null);
  const down=useRef<{x:number;y:number;id:string;time:number}|null>(null),lastTouch=useRef<string|null>(null),look=useRef(new Vector3(0,.25,0));
  const {invalidate,camera,size,gl,scene}=useThree();
  const [labelLayer]=useState(()=>document.createElement('div')),labels=useRef(labelLayer);
  useLayoutEffect(()=>{
    // Drei owns these portal nodes. Keep them outside React's canvas children
    // so deferred island disposal after an Astro swap cannot remove them twice.
    const layer=labels.current;layer.style.cssText='position:absolute;inset:0;pointer-events:none';
    gl.domElement.closest('.scene-island')?.append(layer);
    return()=>layer.remove();
  },[gl]);
  const fit=Math.max(1,1.16/(size.width/size.height));
  const base=useRef(new Vector3(0,6.3*fit,6.8*fit));
  useEffect(()=>{gl.domElement.dataset.selectedProject=active;gl.domElement.dataset.transition=opening||'idle';},[active,opening,gl]);
  useEffect(()=>{base.current.set(0,6.3*fit,6.8*fit);camera.position.copy(base.current);camera.lookAt(0,.25,0);invalidate();},[camera,fit,invalidate]);
  useEffect(()=>{
    const read=(event:Event)=>{const id=(event as CustomEvent<string>).detail;if(regions.some(r=>r.id===id)){setActive(id);invalidate();}};
    const selected=document.querySelector<HTMLElement>('[data-project-world]')?.dataset.selected;
    if(selected)setActive(selected);
    const intent=()=>{setPhysical(activeProjectIntent());invalidate();};intent();
    const surface=gl.domElement.parentElement;
    const leave=()=>{setProjectIntent(null,'hover');gl.domElement.style.cursor='';};
    surface?.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
    window.addEventListener('portfolio:project-intent',intent);
    window.addEventListener('portfolio:project',read);
    return()=>{surface?.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);window.removeEventListener('portfolio:project-intent',intent);window.removeEventListener('portfolio:project',read);transition.current=null;gl.domElement.style.cursor='';};
  },[invalidate,gl]);
  useEffect(()=>{
    const begin=(event:Event)=>{
      const request=(event as CustomEvent<ProjectOpening>).detail;
      const host=gl.domElement.closest<HTMLElement>('.scene-island'),bounds=gl.domElement.getBoundingClientRect();
      const visible=Math.min(bounds.bottom,innerHeight)-Math.max(bounds.top,0);
      if(reducedMotion||transition.current||host?.dataset.state!=='ready'||host.dataset.renderLoop==='paused'||visible<bounds.height*.3)return;
      const region=regions.find(r=>r.id===request.id)!;const view=views[request.id];
      const offset=measured.current[request.id]?.offset??[0,.122,0];
      const target=new Vector3(offset[0],offset[1]+view.y*region.modelScale,offset[2]).applyAxisAngle(new Vector3(0,1,0),view.yaw+.23).add(new Vector3(region.x,region.restY+ACTIVE_LIFT,region.z)).applyAxisAngle(new Vector3(0,1,0),-.23);
      const fitDetail=Math.max(1,1.2/(size.width/size.height));
      const to=target.clone().add(new Vector3(0,2.6,6.2).multiplyScalar(view.scale*.72*fitDetail));
      request.claim();setActive(request.id);setPhysical(request.id);setOpening(request.id);
      const motion:CameraOpening={request,started:performance.now(),ready:false,complete:false,progress:0,from:camera.position.clone(),to,target,midCaptured:false};
      transition.current=motion;
      void request.ready.then(()=>{if(transition.current===motion){motion.ready=true;invalidate();}});invalidate();
    };
    const cancel=()=>{transition.current=null;setOpening(null);setPhysical(null);camera.position.copy(base.current);look.current.set(0,.25,0);camera.lookAt(look.current);groups.current.forEach(group=>{if(group)group.rotation.y=0;});invalidate();};
    const previous=scene.onAfterRender;
    scene.onAfterRender=(...args)=>{
      previous.apply(scene,args);
      const motion=transition.current;if(!motion||motion.complete)return;
      const sample=window.__PORTFOLIO_PROFILE__?.scenes.floorplan;

      const final=motion.progress>=1;

      if(final)motion.complete=true;
      // Capture after all synchronous composer passes, before the browser discards
      // the drawing buffer. The picture is the actual camera's final frame.
      if(final)queueMicrotask(()=>{
        if(transition.current!==motion)return;
        navigationMark('capture-start');const started=performance.now();let picture:HTMLCanvasElement|undefined;
        try{picture=document.createElement('canvas');picture.width=Math.min(1000,size.width);picture.height=Math.round(picture.width*gl.domElement.height/gl.domElement.width);picture.getContext('2d')?.drawImage(gl.domElement,0,0,picture.width,picture.height);}catch{/* Safe normal navigation. */}

        if(final){navigationMark('capture-end');if(sample)sample.captureMs=performance.now()-started;motion.request.finish(picture,{enteredFromProjectWorld:true,graphicsStage:Number(gl.domElement.dataset.graphicsStage||0),cameraOffset:motion.to.clone().sub(motion.target).divideScalar(views[motion.request.id].scale).toArray(),sourceFit:Math.max(1,1.2/(size.width/size.height)),sourceAspect:size.width/size.height,sourceFov:36});}

      });
    };
    window.addEventListener('portfolio:open-project',begin);window.addEventListener('portfolio:cancel-opening',cancel);
    return()=>{window.removeEventListener('portfolio:open-project',begin);window.removeEventListener('portfolio:cancel-opening',cancel);scene.onAfterRender=previous;transition.current=null;};
  },[gl,scene,camera,size.width,size.height,invalidate,reducedMotion]);
  useEffect(()=>{
    if(!window.__PORTFOLIO_PROFILE__)return;
    const overview=()=>{camera.position.set(0,8.2*fit,3.8*fit);camera.lookAt(0,.25,0);invalidate();};
    window.addEventListener('portfolio:footprint-overview',overview);
    return()=>window.removeEventListener('portfolio:footprint-overview',overview);
  },[camera,fit,invalidate]);
  useFrame((_,delta)=>{
    const motion=transition.current;
    groups.current.forEach((group,i)=>{if(group){const target=regions[i].restY+(!reducedMotion&&(regions[i].id===physical||regions[i].id===opening)?ACTIVE_LIFT:0);group.position.y=Math.abs(group.position.y-target)<.0005?target:MathUtils.damp(group.position.y,target,8,Math.min(delta,.25));}});
    if(motion){
      const p=Math.min(1,(performance.now()-motion.started)/motion.request.duration),ease=p*p*p*(10+p*(-15+6*p));motion.progress=p;
      camera.position.lerpVectors(motion.from,motion.to,ease);look.current.lerpVectors(new Vector3(0,.25,0),motion.target,ease);camera.lookAt(look.current);
      const index=regions.findIndex(r=>r.id===motion.request.id),group=groups.current[index];
      if(group){group.rotation.y=(views[motion.request.id].yaw+.23)*ease;if(p===1)group.position.y=regions[index].restY+ACTIVE_LIFT;}
      if(p===1)projectNavigationHolding();
    }
    const sample=window.__PORTFOLIO_PROFILE__?.scenes.floorplan;
    if(sample){
      if(motion)sample.navigation={id:motion.request.id,progress:motion.progress,camera:camera.position.toArray(),target:look.current.toArray()};
      sample.mounts=regions.map((r,i)=>({id:r.id,restY:r.restY,x:groups.current[i]?.position.x??r.x,z:groups.current[i]?.position.z??r.z,y:groups.current[i]?.position.y??r.restY,activeLift:ACTIVE_LIFT}));
      sample.targets=regions.map((r,i)=>{
        const p=new Vector3(0,.36,-.05);groups.current[i]?.localToWorld(p);p.project(camera);
        return {id:r.id,x:(p.x+1)*size.width/2,y:(1-p.y)*size.height/2};
      });
    }
  });
  const open=(id:string)=>openProject(id);
  const start=(event:ThreeEvent<PointerEvent>,id:string)=>{if(event.button!==0)return;event.stopPropagation();down.current={x:event.clientX,y:event.clientY,id,time:performance.now()};};
  const end=(event:ThreeEvent<PointerEvent>,id:string)=>{
    event.stopPropagation();const gesture=down.current;down.current=null;
    if(!gesture||gesture.id!==id||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>8||performance.now()-gesture.time>700)return;
    if(event.pointerType==='mouse')open(id);
    else if(lastTouch.current===id&&active===id)open(id);
    else{lastTouch.current=id;setProjectIntent(id,'tap');}
  };
  return <group rotation={[0,-.23,0]}>
    <group position={[0,-.37,-.28]}><SystemBed width={8.6} depth={7} peripherals={false} tier={tier} reducedMotion={reducedMotion}/></group>
    {[-1,1].map(s=><group key={`wing-${s}`} position={[s*1.72,-.17,s*.12]}><CircuitBoard width={2.9} depth={5.2} tier={tier} seed={56+s} components={false}/><Frame width={2.9} depth={5.2} height={.13}/></group>)}
    <group position={[0,-.04,-3.4]} rotation={[Math.PI/3.5,0,0]}><PowerShelf tier={tier} scale={1.2} muted/></group>
    <group position={[0,-.16,2.9]}><PortBank width={5.4} count={8}/></group>
    <Parts parts={[-1,1].flatMap(s=>Array.from({length:tier==='low'?8:16},(_,i)=>({position:[s*3.93,-.04,(i-(tier==='low'?7:15)/2)*.27] as [number,number,number],size:[.32,.28,.07] as [number,number,number]})))} color='#687e89' metalness={.91} roughness={.3} beveled={tier==='high'}/>
    <group position={[0,-.165,0]}><Plate width={.22} depth={5.3} height={.09} color='#5b6d72'/></group>
    {[-1,1].map(s=><group key={s} position={[s*3.56,.07,-.25]}><PowerBank count={10}/></group>)}
    <Parts parts={[-1,1].flatMap(s=>Array.from({length:15},(_,i)=>({position:[(i-7)*.36,.08,s*2.3] as [number,number,number],size:[.18,.14,.19] as [number,number,number]})).filter(p=>!regions.some(r=>Math.abs(p.position[0]-r.x)<r.dockWidth/2+.1&&Math.abs(p.position[2]-r.z)<r.dockDepth/2+.1)))} color='#1b2e34' metalness={.12}/>
    {regions.map(region=><group key={`dock-${region.id}`} position={[region.x,-.17,region.z]}><Frame width={region.dockWidth+.08} depth={region.dockDepth+.08} height={.05}/></group>)}
    {regions.map((region,i)=>{
      const selected=region.id===active,labelY=.222+(mounts[region.id]?.size[1]??1.2),hitHeight=labelY;
      return <group key={region.id} ref={g=>{groups.current[i]=g;}} position={[region.x,region.restY,region.z]}
        onPointerOver={event=>{event.stopPropagation();if(event.pointerType==='mouse'){setProjectIntent(region.id,'hover');gl.domElement.style.cursor='pointer';}}}
        onPointerOut={()=>{setProjectIntent(null,'hover');if(!transition.current)gl.domElement.style.cursor='';}}
        onPointerDown={event=>start(event,region.id)} onPointerUp={event=>end(event,region.id)} onPointerCancel={()=>{down.current=null;}}>
        <mesh position={[0,hitHeight/2,0]}><boxGeometry args={[region.dockWidth,hitHeight,region.dockDepth]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        <Plate width={region.dockWidth} depth={region.dockDepth} height={.12} color={selected?'#687879':'#3a4a50'} rim bolts={tier!=='low'}/>
        <group position={[0,.07,0]}><CircuitBoard width={region.dockWidth-.12} depth={region.dockDepth-.12} tier={tier} seed={i+70}/></group>
        <group position={[0,.17,-region.dockDepth/2+.13]}><Connector width={region.dockWidth*.5} count={10}/></group>
        <Line points={[[region.dockWidth*.38,.19,-region.dockDepth*.33],[region.dockWidth*.38,labelY-.07,-region.dockDepth*.33]]} color={selected?'#9e763f':'#576b73'} lineWidth={.55} raycast={()=>{}}/>
        <Html portal={labels} position={[region.dockWidth*.38,labelY,-region.dockDepth*.33]} center style={{pointerEvents:'none',opacity:opening&&region.id!==opening ? .3 : 1}}><span aria-hidden="true" style={{display:'block',whiteSpace:'nowrap',padding:'5px 9px 5px 15px',border:`1px solid ${selected?'#c69243':'#6a604c'}`,borderRadius:'3px',background:'#0b1013e0',color:selected?'#ffc36a':'#c0c8c9',font:'500 9px monospace',letterSpacing:'.04em',boxShadow:'0 4px 12px #0008'}}><span style={{position:'absolute',left:'6px',top:'9px',width:'3px',height:'3px',borderRadius:'50%',background:selected?'#e4ac58':'#829398'}}/>{region.label}</span></Html>
        <ProjectMount dock={region} onMeasure={onMeasure}>
          {region.id==='fifo'&&<MemoryBank occupied={selected?[true,true,true,false,false,false,false,false]:[true,false,false,false,false,false,false,false]}/>}
          {region.id==='fpga-arithmetic'&&<ArithmeticTile a={21} b={8} result={29} active={selected} reducedMotion={reducedMotion}/>}
          {region.id==='emg'&&<AcquisitionTile active={selected} reducedMotion={reducedMotion}/>}
          {region.id==='lumalink'&&<OpticalTile active={selected} reducedMotion={reducedMotion}/>}
          {region.id==='mini-lysimeter'&&<InstrumentTile active={selected}/>}
          {region.id==='cubex'&&<Printer reducedMotion={reducedMotion} active={selected}/>}
        </ProjectMount>
        <SignalTrace strength={selected?(opening?1.55:1.2):(opening ? .25 : .55)} reducedMotion={reducedMotion} active={!opening||selected} offset={i*.13} points={[[0,.145,-region.dockDepth*.47],[-region.dockWidth*.44,.145,-region.dockDepth*.47],[-region.dockWidth*.44,.145,region.dockDepth*.4],[region.dockWidth*.44,.145,region.dockDepth*.4]]}/>

      </group>;
    })}
    {regions.flatMap((r,i)=>[0,1].map(n=><SignalTrace key={`${r.id}-${n}`} spill={active===r.id&&n===0?1.3:0} strength={active===r.id?1.35:(opening ? .25 : .75)} reducedMotion={reducedMotion} active={!opening||active===r.id} offset={i*.13+n*.3} points={[[-3.9,-.25,-2.4+n*.13],[-3.35,-.25,-2.4+n*.13],[-3.35,.07,-2.13+n*.13],[-3.35,.07,n*.13],[r.x,.07,n*.13],[r.x,.07,r.z-r.dockDepth*.48],[r.x,r.restY+.18+(!reducedMotion&&physical===r.id?ACTIVE_LIFT:0),r.z-r.dockDepth*.48]]}/>))}
  </group>;
}
