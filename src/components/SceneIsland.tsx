import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneKind } from './three/types';

const loadCanvas = () => import('./three/CanvasShell');
const CanvasShell = lazy(loadCanvas);

class GraphicsBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function SceneIsland({ scene = 'hero' }: { scene?: SceneKind }) {
  const host = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [generation,setGeneration]=useState(0);
  const recovery=useRef({attempted:false,timer:0});
  const ready=useCallback(()=>{setStatus('ready');if(window.__PROJECT_HANDOFF__)window.dispatchEvent(new Event('portfolio:destination-ready'));},[]);
  const fail=useCallback(()=>{setStatus('fallback');if(window.__PROJECT_HANDOFF__)window.dispatchEvent(new Event('portfolio:destination-ready'));},[]);
  const recover=useCallback(()=>{
    setLoad(false);fail();
    if(recovery.current.attempted)return;
    recovery.current.attempted=true;
    recovery.current.timer=window.setTimeout(()=>{setGeneration(value=>value+1);setStatus('loading');setLoad(true);},750);
  },[fail]);
  useEffect(()=>()=>clearTimeout(recovery.current.timer),[]);
  const fallback = `/art/${scene}-render.webp`;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (new URLSearchParams(location.search).get('graphics') === 'static') {
      setStatus('fallback');
      return;
    }
    // The real renderer is the capability check; a separate temporary WebGL
    // context delays startup and consumes another driver allocation.
    if(scene==='hero'||window.__PROJECT_HANDOFF__){void loadCanvas();if(scene==='hero')void import('./three/HeroScene');setLoad(true);return;}
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        void loadCanvas();
        setLoad(true);
      }
    }, { rootMargin: '250px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [scene,fail]);
  return (
    <div className="scene-island" ref={host} data-state={status} data-scene={scene} aria-hidden="true">
      <img className="scene-fallback" src={fallback} width="900" height={scene==='hero'?900:600} alt="" loading={scene==='hero'?'eager':'lazy'} fetchPriority={scene==='hero'?'high':'auto'} />
      {load && status !== 'fallback' && <GraphicsBoundary key={generation} onFailure={fail}>
        <Suspense fallback={null}><CanvasShell scene={scene} host={host} onReady={ready} onFailure={fail} onContextLost={recover} /></Suspense>
      </GraphicsBoundary>}
    </div>
  );
}
