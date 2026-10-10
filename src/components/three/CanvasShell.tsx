import { Suspense, lazy, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { GraphicsTier, SceneKind, SceneProps } from './types';

const sceneModules: Partial<Record<SceneKind, ReturnType<typeof lazy<React.ComponentType<SceneProps>>>>> = {
  hero: lazy(() => import('./HeroScene')),
};

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
    if (frame.current % 60 === 0) {
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
  return <Canvas className="scene-canvas" dpr={[1,dpr]} frameloop={visible ? (reducedMotion ? 'demand' : 'always') : 'never'} camera={{ position: [0,1.35,7.5], fov:36, near:.1, far:40 }} gl={{ alpha:true, antialias:tier !== 'low', powerPreference:'default' }}>
    <RenderLifecycle onReady={onReady} onFailure={onFailure} reducedMotion={reducedMotion} tier={tier} />
    <ambientLight intensity={.65} />
    <directionalLight position={[-3,5,4]} color="#b8f4ff" intensity={3} />
    <directionalLight position={[4,2,-3]} color="#9d81f0" intensity={3.5} />
    <Suspense fallback={null}>{Scene && <Scene reducedMotion={reducedMotion} tier={tier} />}</Suspense>
  </Canvas>;
}
