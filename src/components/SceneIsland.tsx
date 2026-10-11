import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneKind } from './three/types';
import {webglAvailable} from '../lib/webgl';

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
  const ready=useCallback(()=>setStatus('ready'),[]);
  const fail=useCallback(()=>setStatus('fallback'),[]);
  const fallback = `/art/${scene}-render.webp`;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (new URLSearchParams(location.search).get('graphics') === 'static') {
      setStatus('fallback');
      return;
    }
    let mounted=true;
    if(scene==='hero'){void loadCanvas();void import('./three/HeroScene');webglAvailable().then(available=>{if(mounted){if(available)setLoad(true);else setStatus('fallback');}});return()=>{mounted=false;};}
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        void loadCanvas();
        webglAvailable().then(available=>{if(mounted){if(available)setLoad(true);else setStatus('fallback');}});
      }
    }, { rootMargin: '250px' });
    observer.observe(element);
    return () => {mounted=false;observer.disconnect();};
  }, [scene]);
  return (
    <div className="scene-island" ref={host} data-state={status} data-scene={scene} aria-hidden="true">
      <img className="scene-fallback" src={fallback} width="900" height={scene==='hero'?900:600} alt="" loading={scene==='hero'?'eager':'lazy'} fetchPriority={scene==='hero'?'high':'auto'} />
      {load && status !== 'fallback' && <GraphicsBoundary onFailure={fail}>
        <Suspense fallback={null}><CanvasShell scene={scene} host={host} onReady={ready} onFailure={fail} /></Suspense>
      </GraphicsBoundary>}
    </div>
  );
}
