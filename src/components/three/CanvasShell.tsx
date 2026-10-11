import { Suspense, lazy, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {PMREMGenerator,ACESFilmicToneMapping} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type { GraphicsTier, SceneKind, SceneProps } from './types';
import EnergyBloom from './EnergyBloom';

const sceneModules: Partial<Record<SceneKind, ReturnType<typeof lazy<React.ComponentType<SceneProps>>>>> = {
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

function SteelEnvironment() {
  const {gl,scene,invalidate}=useThree();
  useEffect(()=>{
    const room=new RoomEnvironment(),generator=new PMREMGenerator(gl);
    const environment=generator.fromScene(room,.04);
    scene.environment=environment.texture;scene.environmentIntensity=.32;
    gl.toneMapping=ACESFilmicToneMapping;gl.toneMappingExposure=1.02;
    room.dispose();generator.dispose();invalidate();
    return()=>{scene.environment=null;environment.dispose();};
  },[gl,scene,invalidate]);
  return null;
}

function WarmShaders({onPrepared,onFailure}:{onPrepared:()=>void;onFailure:()=>void}) {
  const {gl,scene,camera}=useThree();
  useEffect(()=>{
    let mounted=true;
    // Keep the rendered fallback visible while the scene compiles. On drivers with
    // KHR_parallel_shader_compile this avoids a synchronous first-draw stall.
    gl.compileAsync(scene,camera).then(()=>{if(mounted)onPrepared();}).catch(()=>{if(mounted)onFailure();});
    return()=>{mounted=false;};
  },[gl,scene,camera,onPrepared,onFailure]);
  return null;
}

function RenderLifecycle({ onReady, onFailure, reducedMotion, tier }: SceneProps & { onReady: () => void; onFailure: () => void }) {
  const { gl, invalidate } = useThree();
  const announced=useRef(false);
  const frame=useRef(0);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.dataset.graphicsTier = tier;
    const fail = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', fail);
    invalidate();
    return () => canvas.removeEventListener('webglcontextlost', fail);
  }, [gl, invalidate, onFailure, reducedMotion, tier]);
  useFrame(() => {
    frame.current++;
    if (!announced.current) {
      if (gl.info.render.calls > 0) { announced.current=true; onReady(); }
      else invalidate();
    }
    if (frame.current % 30 === 0 || frame.current === 3) {
      gl.domElement.dataset.frames = String(frame.current);
      gl.domElement.dataset.dpr = String(gl.getPixelRatio());
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
      gl.domElement.dataset.triangles = String(gl.info.render.triangles);
      gl.domElement.dataset.textures = String(gl.info.memory.textures);
      gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
    }
  });
  return null;
}

export default function CanvasShell({ scene, host, onReady, onFailure }: {
  scene: SceneKind; host: RefObject<HTMLDivElement | null>; onReady: () => void; onFailure: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tier, setTier] = useState<GraphicsTier>('medium');
  const [prepared,setPrepared]=useState(false);
  const preparedScene=useCallback(()=>setPrepared(true),[]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const chooseTier = () => setTier(window.matchMedia('(pointer: coarse)').matches || innerWidth < 768 ? 'low' : innerWidth >= 1600 ? 'high' : 'medium');
    updateMotion(); chooseTier();
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility(); }, { rootMargin:'100px' });
    if (host.current) observer.observe(host.current);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', chooseTier, { passive:true });
    media.addEventListener('change', updateMotion);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', chooseTier); media.removeEventListener('change', updateMotion); };
  }, [host]);
  const Scene = sceneModules[scene];
  const dpr = tier === 'high' ? 1.75 : tier === 'medium' ? 1.35 : 1;
  useEffect(()=>{
    if(host.current)host.current.dataset.renderLoop=visible?(reducedMotion?'demand':'always'):'paused';
  },[host,visible,reducedMotion]);
  return <Canvas className="scene-canvas" shadows={tier!=='low'?'soft':false} dpr={[1,dpr]} frameloop={visible&&prepared ? (reducedMotion ? 'demand' : 'always') : 'never'} camera={{ position: [0,1.35,7.5], fov:36, near:.1, far:40 }} gl={{ alpha:true, antialias:tier !== 'low', powerPreference:'default' }}>
    <RenderLifecycle onReady={onReady} onFailure={onFailure} reducedMotion={reducedMotion} tier={tier} />
    <SteelEnvironment/><ambientLight intensity={.16} />
    <fog attach="fog" args={['#07090b',9,19]}/>
    <directionalLight castShadow position={[-3,5,4]} color="#e4eef5" intensity={1.65} shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-far={18} shadow-bias={-.00025} shadow-normalBias={.012} />
    <directionalLight position={[4,2,-3]} color="#c4dbea" intensity={1.05} />
    <Suspense fallback={null}>{Scene && <Scene reducedMotion={reducedMotion} tier={tier} />}<WarmShaders onPrepared={preparedScene} onFailure={onFailure}/></Suspense>
    {tier!=='low'&&<EnergyBloom cinematic={scene==='hero'||scene==='floorplan'}/>}
  </Canvas>;
}
