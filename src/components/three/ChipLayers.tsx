import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox,Line} from '@react-three/drei';
import {Group,MathUtils,MeshStandardMaterial} from 'three';
import {Plate,Chip,Bolt,AMBER,ContactShade} from './Hardware';
import SignalTrace from './SignalTrace';
import type {SceneProps} from './types';

export default function ChipLayers({progress,active,reducedMotion,tier}:SceneProps&{progress:React.RefObject<number>;active:number}) {
  const groups=useRef<(Group|null)[]>([]),core=useRef<MeshStandardMaterial>(null),time=useRef(0);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.05);if(!reducedMotion)time.current+=dt;
    const separation=reducedMotion?0:MathUtils.smoothstep(progress.current,.15,.92);
    groups.current.forEach((g,i)=>{if(g){
      const selected=active===i;
      g.position.y=MathUtils.damp(g.position.y,(i===5?1.06:-.48+i*.27)+i*separation*.24+(selected?separation*.07:0)+(reducedMotion?0:Math.sin(time.current*.35+i)*.005),4,dt);
      g.position.x=MathUtils.damp(g.position.x,selected?separation*.15:0,4,dt);
    }});
    if(core.current)core.current.emissiveIntensity=reducedMotion?.4:.43+Math.sin(time.current*.9)*.08;
  });
  return <group>
    <ContactShade width={4.4} depth={3.8} position={[0,-.62,0]}/>
    {[0,1,2,3,4].map(i=><group key={i} ref={g=>{groups.current[i]=g;}} position={[0,-.48+i*.27,0]}>
      <mesh position={[0,-.025,(2.95-i*.32)/2+.006]}><boxGeometry args={[(3.6-i*.38)*.75,.018,.014]}/><meshBasicMaterial color="#ffc05b" toneMapped={false}/></mesh>
      <mesh position={[0,-.025,(2.95-i*.32)/2+.012]}><boxGeometry args={[(3.6-i*.38)*.76,.07,.02]}/><meshBasicMaterial color="#ff9f25" transparent opacity={.13} depthWrite={false} toneMapped={false}/></mesh>
      <Plate width={3.6-i*.38} depth={2.95-i*.32} height={i===0?.18:.095} color={i===0?'#15191c':i%2?'#252b2f':'#1c2226'} rim bolts={tier!=='low'}/>
      {[-1,1].map(side=><SignalTrace key={side} reducedMotion={reducedMotion} active={i===active||i===2||i===4} offset={i*.13+(side+1)*.22} points={[[side*(1.5-i*.18),.055,-1.1+i*.14],[side*(.75-i*.06),.055,-1.1+i*.14],[side*(.75-i*.06),.055,-.55+i*.06],[side*.4,.055,-.55+i*.06],[side*.4,.055,.8-i*.1],[side*(1.3-i*.16),.055,.8-i*.1]]}/>)}
      {i<4&&tier!=='low'&&[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}-${z}`} position={[x*(1.35-i*.15),.145,z*(1.07-i*.13)]}><cylinderGeometry args={[.055,.055,.19,8]}/><meshStandardMaterial color="#777f84" metalness={.9} roughness={.31}/></mesh>))}
      {i===2&&[-1,1].map(side=><group key={side} position={[side*.78,.13,0]}><Chip width={.42} depth={.8} active={active===2}/></group>)}
      {i===4&&<group>
        <RoundedBox args={[1.37,.12,1.22]} radius={.035} smoothness={2} position={[0,.12,0]}><meshStandardMaterial color="#111416" metalness={.6} roughness={.28}/></RoundedBox>
        <RoundedBox args={[.95,.08,.82]} radius={.02} smoothness={2} position={[0,.24,0]}><meshStandardMaterial ref={core} color="#af7629" metalness={.8} roughness={.33} emissive={AMBER} emissiveIntensity={.43}/></RoundedBox>
        <Line points={[[-.58,.28,-.5],[.58,.28,-.5],[.58,.28,.5],[-.58,.28,.5],[-.58,.28,-.5]]} color={AMBER} lineWidth={1.7}/>
        {tier!=='low'&&Array.from({length:6},(_,n)=><Line key={n} points={[[-.39,.283,-.31+n*.12],[.39,.283,-.31+n*.12]]} color="#d3ad6a" lineWidth={.5} transparent opacity={.5}/>)}
        {[-1,1].map(side=><SignalTrace key={side} reducedMotion={reducedMotion} offset={(side+1)*.25} points={[[side*.88,.055,.68],[side*.68,.055,.68],[side*.68,.06,.37],[side*.6,.22,.37],[side*.46,.28,.37],[0,.28,.37]]}/>)}
      </group>}
    </group>)}
    <group ref={g=>{groups.current[5]=g;}} position={[0,1.06,0]}>
      <RoundedBox args={[2.2,.035,1.8]} radius={.025} smoothness={2}><meshPhysicalMaterial color="#849394" metalness={.2} roughness={.2} transparent opacity={.14} depthWrite={false}/></RoundedBox>
      <Line points={[[-1.1,.02,-.9],[1.1,.02,-.9],[1.1,.02,.9],[-1.1,.02,.9],[-1.1,.02,-.9]]} color="#a8b3b7" lineWidth={.8} transparent opacity={.55}/>
      {[-1,1].flatMap(x=>[-1,1].map(z=><Bolt key={`${x}-${z}`} position={[x*.95,.027,z*.74]}/>))}
    </group>
  </group>;
}
