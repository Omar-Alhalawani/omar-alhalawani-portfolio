import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {BoxGeometry,MeshStandardMaterial} from 'three';
import {AMBER} from './Hardware';
import {useResource} from './resources';
// Local controller power, independent of a demonstration's running state.
export default function PoweredIndicator({position,running=false,reducedMotion=false,color=AMBER}:{position:[number,number,number];running?:boolean;reducedMotion?:boolean;color?:string}){
 const geometry=useResource('controller-power-indicator',()=>new BoxGeometry(.065,.025,.065));
 const {gl}=useThree();
 const material=useRef<MeshStandardMaterial>(null),clock=useRef(0);
 useEffect(()=>{const m=material.current;return()=>m?.dispose();},[]);
 useFrame((_,delta)=>{if(!reducedMotion)clock.current+=Math.min(delta,.1);if(material.current)material.current.emissiveIntensity=reducedMotion?.25:running?.65:.18+.09*(.5+.5*Math.sin(clock.current*2.4));if(window.__PORTFOLIO_PROFILE__){const kind=gl.domElement.closest<HTMLElement>('.scene-island')?.dataset.scene||'',sample=window.__PORTFOLIO_PROFILE__.scenes[kind];if(sample){sample.powered??={};sample.powered[position.join(',')]=material.current?.emissiveIntensity??0;}}});
 return <mesh geometry={geometry} dispose={null} position={position} raycast={()=>{}}><meshStandardMaterial ref={material} color={color} emissive={color} emissiveIntensity={.25} roughness={.4}/></mesh>;
}
