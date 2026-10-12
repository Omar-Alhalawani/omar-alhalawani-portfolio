import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {BufferAttribute,BufferGeometry,Line,LineBasicMaterial,MathUtils} from 'three';

export default function Waveform({position=[0,.4,0],width=2.6,amplitude=.3,noisy=false,color='#ffbd59',reducedMotion=false,active=true}:{position?:[number,number,number];width?:number;amplitude?:number;noisy?:boolean;color?:string;reducedMotion?:boolean;active?:boolean}) {
  const level=useRef(amplitude),time=useRef(0),update=useRef({initialized:false,elapsed:0});
  const line=useMemo(()=>{
    const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(128*3),3));
    const waveform=new Line(geometry,new LineBasicMaterial({color,transparent:true,opacity:.9}));
    // Decorative signal lines must not steal module hits: THREE.Line's default
    // one-world-unit ray threshold is much wider than this instrumentation tile.
    waveform.raycast=()=>{};
    return waveform;
  },[color]);
  useEffect(()=>{update.current.initialized=false;},[line,width,amplitude,noisy]);
  useEffect(()=>()=>{line.geometry.dispose();line.material.dispose();},[line]);
  useFrame((_,delta)=>{
    if(active&&!reducedMotion)time.current+=Math.min(delta,.05);
    level.current=reducedMotion?amplitude:MathUtils.damp(level.current,amplitude,6,Math.min(delta,.1));
    const sample=update.current;sample.elapsed+=Math.min(delta,.05);
    if(sample.initialized&&(!active||reducedMotion||sample.elapsed<1/30))return;
    sample.initialized=true;sample.elapsed=0;
    const attribute=line.geometry.getAttribute('position');
    for(let i=0;i<128;i++) {
      const x=i/127;const t=x*18-time.current*1.5;
      const envelope=.35+.65*Math.pow(Math.sin(x*5.5+.3),2);
      const y=(Math.sin(t)*.62+Math.sin(t*2.1)*.25)*envelope+(noisy?Math.sin(t*9.3)*.19+Math.sin(t*17.1)*.1:0);
      attribute.setXYZ(i,(x-.5)*width,y*level.current,0);
    }
    attribute.needsUpdate=true;
  });
  return <primitive object={line} position={position}/>;
}
