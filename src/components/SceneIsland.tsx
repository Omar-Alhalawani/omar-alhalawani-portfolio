import { Component, Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {navigationMark} from '../lib/navigation-metrics';
import {scenePresentation} from '../lib/scene-presentation';
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
  const [fallbackReason,setFallbackReason]=useState<'unavailable'|'static'|'data-saver'>('unavailable');
  const [generation,setGeneration]=useState(0);
  const recovery=useRef({attempted:false,timer:0});
  const destination=()=>Boolean(window.__PROJECT_HANDOFF__&&location.pathname===`/projects/${window.__PROJECT_HANDOFF__.id}`&&scene!=='floorplan'&&scene!=='hero'&&scene!=='verification');
  const ready=useCallback(()=>{setStatus('ready');if(destination())navigationMark('destination-first-frame');},[scene]);
  const fail=useCallback(()=>{setStatus('fallback');},[]);
  useLayoutEffect(()=>{if(status!=='loading'&&destination())window.dispatchEvent(new Event('portfolio:destination-ready'));},[status,scene]);
  const recover=useCallback(()=>{
    setLoad(false);fail();
    if(recovery.current.attempted)return;
    recovery.current.attempted=true;
    recovery.current.timer=window.setTimeout(()=>{setGeneration(value=>value+1);setStatus('loading');setLoad(true);},750);
  },[fail]);
  useEffect(()=>()=>clearTimeout(recovery.current.timer),[]);
  useEffect(()=>{
    const element=host.current;
    if(!element||!load||status!=='loading')return;
    let timer=0,inView=false;
    // A stalled shader/import must leave the real poster available. Count only
    // visible loading time, so deferred/offscreen scenes aren't timed out.
    const update=()=>{clearTimeout(timer);if(inView&&!document.hidden)timer=window.setTimeout(fail,30000);};
    const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update();});
    observer.observe(element);document.addEventListener('visibilitychange',update);
    return()=>{observer.disconnect();clearTimeout(timer);document.removeEventListener('visibilitychange',update);};
  },[load,status,fail]);
  const presentation=scenePresentation[scene],fallback=presentation.image;
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if(destination()){element.dataset.handoff='true';navigationMark('scene-mount');}
    if (new URLSearchParams(location.search).get('graphics') === 'static'||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData&&!window.__PROJECT_HANDOFF__) {
      setFallbackReason(new URLSearchParams(location.search).get('graphics')==='static'?'static':'data-saver');
      fail();
      return;
    }
    // The real renderer is the capability check; a separate temporary WebGL
    // context delays startup and consumes another driver allocation.
    if(scene==='hero'||window.__PROJECT_HANDOFF__){void loadCanvas().catch(fail);if(scene==='hero')void import('./three/HeroScene').catch(fail);setLoad(true);return;}
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        void loadCanvas().catch(fail);
        setLoad(true);
      }
    }, { rootMargin: '250px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [scene,fail]);
  return (
    <div className="scene-island" ref={host} data-state={status} data-scene={scene} aria-busy={status==='loading'&&load}>
      <div aria-hidden="true">
      <img className="scene-fallback" src={fallback} width="900" height={scene==='hero'?900:600} alt="" loading={scene==='hero'?'eager':'lazy'} fetchPriority={scene==='hero'?'high':'auto'} />
      {load && status !== 'fallback' && <GraphicsBoundary key={generation} onFailure={fail}>
        <Suspense fallback={null}><CanvasShell scene={scene} host={host} onReady={ready} onFailure={fail} onContextLost={recover} /></Suspense>
      </GraphicsBoundary>}
      </div>
      {presentation.labels.length>0&&<div className="scene-key" aria-label="Illustrated components">{presentation.labels.map(label=><span key={label}>{label}</span>)}</div>}
      {(load&&status==='loading'||status==='fallback')&&<span className="scene-status" role="status" aria-live="polite">{status==='loading'?'Loading interactive view…':fallbackReason==='data-saver'?'Static view · data saver':fallbackReason==='static'?'Static view':'Interactive 3D unavailable · static view shown'}</span>}
    </div>
  );
}
