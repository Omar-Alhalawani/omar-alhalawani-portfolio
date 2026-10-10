import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, ShaderMaterial } from 'three';
import { vertexShader, fragmentShader } from './shaders/silicon';
import type { SceneProps } from './types';

export default function SiliconForm({ progress, reducedMotion, tier }: SceneProps & { progress: React.RefObject<number> }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime:{value:2.4}, uMorph:{value:0}, uDetail:{value:tier==='low'?.3:1} }),[tier]);
  const segments = tier==='high' ? [96,64] : tier==='medium' ? [64,40] : [40,24];
  useFrame((_,delta) => {
    if (!material.current) return;
    const u=material.current.uniforms;
    if (!reducedMotion) u.uTime.value += Math.min(delta,.05);
    if(reducedMotion) { u.uTime.value=2.4; u.uMorph.value=.34; }
    else u.uMorph.value = MathUtils.damp(u.uMorph.value,MathUtils.smoothstep(progress.current,.1,.67),4,Math.min(delta,.1));
  });
  return <mesh>
    <sphereGeometry args={[1,segments[0],segments[1]]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
  </mesh>;
}
