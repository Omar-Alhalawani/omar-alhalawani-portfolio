import { Suspense, lazy, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {PMREMGenerator,ACESFilmicToneMapping,EquirectangularReflectionMapping,SRGBColorSpace} from 'three';
import {useResource,canvasTexture} from './resources';
import {useRenderBudget} from './renderBudget';
import './profile';
import {DetailTier} from './quality';
import type { GraphicsTier, SceneKind, SceneProps } from './types';
const EnergyBloom=lazy(()=>import('./EnergyBloom'));

const sceneModules: Partial<Record<SceneKind, ReturnType<typeof lazy<React.ComponentType<SceneProps>>>>> = {
  contact: lazy(() => import('./ContactGlobeScene')),
  hero: lazy(() => import('./HeroScene')),
  verification: lazy(() => import('./ExperienceScene')),
  floorplan: lazy(() => import('./ProjectFloorplan')),
  fifo: lazy(() => import('./projects/FifoScene')),
  fpga: lazy(() => import('./projects/FpgaScene')),
  emg: lazy(() => import('./projects/EmgScene')),
  lumalink: lazy(() => import('./projects/LumaScene')),
  cubex: lazy(() => import('./projects/CubexScene')),
  daq: lazy(() => import('./projects/DaqScene')),
};

function SteelEnvironment({kind}:{kind:SceneKind}) {
 const {gl,scene,invalidate}=useThree();
 const source=useResource('softbox-environment',()=>{const t=canvasTexture(x=>{x.fillStyle='#0b1015';x.fillRect(0,0,128,128);for(const [cx,cy,w,h,color] of [[31,35,30,62,'#889fae'],[96,40,18,50,'#b9c6ca'],[64,92,42,8,'#5f4732']] as const){const g=x.createRadialGradient(cx,cy,0,cx,cy,w);g.addColorStop(0,color);g.addColorStop(1,'#0b1015');x.fillStyle=g;x.fillRect(cx-w,cy-h/2,w*2,h);} },128,true);t.mapping=EquirectangularReflectionMapping;t.colorSpace=SRGBColorSpace;return t;});
 useEffect(()=>{
  const started=performance.now(),generator=new PMREMGenerator(gl),environment=generator.fromEquirectangular(source);
  const p=window.__PORTFOLIO_PROFILE__;if(p)(p.scenes[kind]??={}).pmremMs=performance.now()-started;
  scene.environment=environment.texture;scene.environmentIntensity=kind==='hero'?.85:kind==='floorplan'&&matchMedia('(pointer: coarse)').matches?.9:.65;
  gl.toneMapping=ACESFilmicToneMapping;gl.toneMappingExposure=1.02;
  generator.dispose();invalidate();return()=>{scene.environment=null;environment.dispose();};
 },[gl,scene,invalidate,source,kind]);
 return null;
}

function WarmShaders({onPrepared,onFailure,kind}:{onPrepared:()=>void;onFailure:()=>void;kind:SceneKind}) {
  const {gl,scene,camera}=useThree();
  useEffect(()=>{
    let mounted=true;
    // Keep the rendered fallback visible while the scene compiles. On drivers with
    // KHR_parallel_shader_compile this avoids a synchronous first-draw stall.
    const started=performance.now(),p=window.__PORTFOLIO_PROFILE__;if(p)(p.scenes[kind]??={}).compileStartedMs=started;
    gl.compileAsync(scene,camera).then(()=>{if(mounted){if(p){const sample=p.scenes[kind]??={};sample.compileMs=performance.now()-started;sample.programs=gl.info.programs?.length;const context=gl.getContext(),extension=context.getExtension('WEBGL_debug_renderer_info');sample.renderer=extension?context.getParameter(extension.UNMASKED_RENDERER_WEBGL):context.getParameter(context.RENDERER);}onPrepared();}}).catch(()=>{if(mounted)onFailure();});
    return()=>{mounted=false;};
  },[gl,scene,camera,onPrepared,onFailure,kind]);
  return null;
}

function RenderLifecycle({onReady,onContextLost,reducedMotion,tier,kind,stage,onSlow}:{onReady:()=>void;onContextLost:()=>void;reducedMotion:boolean;tier:GraphicsTier;kind:SceneKind;stage:number;onSlow:(delta:number)=>void}) {
 const {gl,scene,invalidate}=useThree(),announced=useRef(false),time=useRef(0);
 useEffect(()=>{const canvas=gl.domElement;const fail=(event:Event)=>{event.preventDefault();onContextLost();};canvas.addEventListener('webglcontextlost',fail);invalidate();return()=>canvas.removeEventListener('webglcontextlost',fail);},[gl,invalidate,onContextLost]);
 useEffect(()=>{
  let mounted=true;const previous=scene.onAfterRender;
  const completed:typeof scene.onAfterRender=(...args)=>{
   previous.call(scene,...args);
   if(announced.current||gl.getContext().isContextLost()||gl.info.render.calls===0)return;
   announced.current=true;
   // Runs after the composer finishes this draw, without waiting for another frame.
   queueMicrotask(()=>{if(!mounted)return;const p=window.__PORTFOLIO_PROFILE__;if(p)(p.scenes[kind]??={}).firstFrameMs=performance.now();onReady();});
  };
  scene.onAfterRender=completed;
  return()=>{mounted=false;if(scene.onAfterRender===completed)scene.onAfterRender=previous;};
 },[gl,scene,kind,onReady]);
 useFrame((_,delta)=>{
  if(!reducedMotion)onSlow(delta);
  const p=window.__PORTFOLIO_PROFILE__;if(p){time.current+=delta;if(time.current>.5){time.current=0;const sample=p.scenes[kind]??={};Object.assign(sample,{dpr:gl.getPixelRatio(),drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,textures:gl.info.memory.textures,geometries:gl.info.memory.geometries,stage});}}
 });
 useEffect(()=>{gl.domElement.dataset.graphicsTier=tier;gl.domElement.dataset.graphicsStage=String(stage);},[gl,tier,stage]);
 return null;
}

export default function CanvasShell({ scene, host, onReady, onFailure, onContextLost }: {
  scene: SceneKind; host: RefObject<HTMLDivElement | null>; onReady: () => void; onFailure: () => void; onContextLost:()=>void;
}) {
  const visible=useRenderBudget(host);
  const [stage,setStage]=useState(()=>typeof window==='undefined'?0:Math.max(0,Math.min(6,window.__PROJECT_HANDOFF__?.entry?.graphicsStage??0)));
  const monitor=useRef({elapsed:0,frames:0,poor:0,healthy:0,last:0});
  const onSlow=useCallback((delta:number)=>{const m=monitor.current;if(!Number.isFinite(delta)||delta<=0)return;m.elapsed+=Math.min(delta,1);m.frames++;if(m.elapsed<1)return;const mean=m.elapsed/m.frames;m.last++;m.poor=mean>.028?m.poor+1:0;m.healthy=mean<.019?m.healthy+1:0;if(m.poor>=4&&m.last>=4){setStage(value=>Math.min(6,value+1));m.poor=m.last=0;}else if(m.healthy>=25&&m.last>=25){setStage(value=>Math.max(0,value-1));m.healthy=m.last=0;}m.elapsed=m.frames=0;},[]);
  const [reducedMotion, setReducedMotion] = useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [tier, setTier] = useState<GraphicsTier>(()=>typeof window==='undefined'?'medium':(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData||window.matchMedia('(pointer: coarse)').matches||innerWidth<768?'low':innerWidth>=1600?'high':'medium');
  const [prepared,setPrepared]=useState(false);
  const preparedScene=useCallback(()=>setPrepared(true),[]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const chooseTier = () => setTier((navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData || window.matchMedia('(pointer: coarse)').matches || innerWidth < 768 ? 'low' : innerWidth >= 1600 ? 'high' : 'medium');
    updateMotion(); chooseTier();
    window.addEventListener('resize', chooseTier, { passive:true });
    media.addEventListener('change', updateMotion);
    return () => { window.removeEventListener('resize', chooseTier); media.removeEventListener('change', updateMotion); };
  }, [host]);
  const Scene = sceneModules[scene];
  const detailTier=stage>=6?'low':tier;
  const dpr=scene==='contact'?(tier==='low'||stage>=2?1:stage>=1?1.1:1.25):tier==='low'?1:stage>=2?1:stage>=1?1.1:tier==='high'?1.4:1.25;
  const bloom=tier!=='low'&&stage<3,shadows=scene!=='contact'&&tier!=='low'&&stage<5;
  useEffect(()=>{
    if(host.current)host.current.dataset.renderLoop=visible?(reducedMotion?'demand':'always'):'paused';
  },[host,visible,reducedMotion]);
  return <Canvas className="scene-canvas" shadows={shadows} dpr={[1,dpr]} frameloop={visible&&prepared ? (reducedMotion ? 'demand' : 'always') : 'never'} camera={{ position: [0,1.35,7.5], fov:36, near:.1, far:40 }} gl={{ alpha:true, antialias:false, powerPreference:'default' }}>
    <RenderLifecycle onReady={onReady} onContextLost={onContextLost} reducedMotion={reducedMotion} tier={detailTier} kind={scene} stage={stage} onSlow={onSlow} />
    <SteelEnvironment kind={scene}/><ambientLight intensity={scene==='floorplan'&&tier==='low'?.28:.16} />
    <fog attach="fog" args={['#07090b',9,19]}/>
    <directionalLight castShadow={shadows} position={[-3,5,4]} color="#e4eef5" intensity={2.05} shadow-mapSize={stage>=4||tier==='medium'?[512,512]:[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-far={18} shadow-bias={-.00025} shadow-normalBias={.012} />
    <directionalLight position={[4,2,-3]} color="#c4dbea" intensity={1.25} />
    <DetailTier.Provider value={detailTier}><Suspense fallback={null}>{Scene && <Scene reducedMotion={reducedMotion} tier={detailTier} />}<WarmShaders onPrepared={preparedScene} onFailure={onFailure} kind={scene}/></Suspense></DetailTier.Provider>
    {bloom&&<Suspense fallback={null}><EnergyBloom/></Suspense>}
  </Canvas>;
}
