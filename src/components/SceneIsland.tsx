import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneKind } from './three/types';

const CanvasShell = lazy(() => import('./three/CanvasShell'));

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
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const probe = document.createElement('canvas');
    let context: WebGL2RenderingContext | WebGLRenderingContext | null = null;
    try { context = probe.getContext('webgl2') || probe.getContext('webgl'); } catch { /* Static artwork is already present. */ }
    if (!context || new URLSearchParams(location.search).get('graphics') === 'static') {
      setStatus('fallback');
      return;
    }
    context.getExtension('WEBGL_lose_context')?.loseContext();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoad(true); observer.disconnect(); }
    }, { rootMargin: '250px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="scene-island" ref={host} data-state={status} data-scene={scene} aria-hidden="true">
      <img className="scene-fallback" src="/art/silicon-fallback.svg" width="900" height="900" alt="" />
      {load && status !== 'fallback' && <GraphicsBoundary onFailure={() => setStatus('fallback')}>
        <Suspense fallback={null}><CanvasShell scene={scene} host={host} onReady={() => setStatus('ready')} onFailure={() => setStatus('fallback')} /></Suspense>
      </GraphicsBoundary>}
    </div>
  );
}
