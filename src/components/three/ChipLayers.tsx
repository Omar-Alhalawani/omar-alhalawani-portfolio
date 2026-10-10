import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, RoundedBox } from '@react-three/drei';
import { Group, MathUtils } from 'three';
import type { SceneProps } from './types';

export default function ChipLayers({ progress, active, reducedMotion }: SceneProps & { progress: React.RefObject<number>; active: number }) {
  const groups=useRef<(Group|null)[]>([]);
  useFrame((_,delta) => {
    const separation=reducedMotion ? 0 : MathUtils.smoothstep(progress.current,.38,.94);
    groups.current.forEach((g,i) => {
      if (!g) return;
      g.position.y=MathUtils.damp(g.position.y,-.05-(i+1)*(.11+separation*.32),5,Math.min(delta,.1));
      g.scale.setScalar(.92+separation*.08);
    });
  });
  return <>{[0,1,2,3].map(i=><group key={i} ref={g=>{groups.current[i]=g;}} position={[0,-.18-i*.12,0]}>
    <RoundedBox args={[3.33,.09,2.76]} radius={.025} smoothness={2}>
      <meshStandardMaterial color={active===i+1?'#1a3543':'#0c1627'} metalness={.75} roughness={.3} />
    </RoundedBox>
    {[0,1,2].map(j=><Line key={j} points={[[-1.42,.051,-.9+j*.55],[-.75,.051,-.9+j*.55],[-.43,.051,-.55+j*.55],[.9,.051,-.55+j*.55],[1.35,.051,-.15+j*.55]]} color={active===i+1?'#75e4f6':'#31566a'} lineWidth={active===i+1?1.5:.65} transparent opacity={.8} />)}
  </group>)}</>;
}
