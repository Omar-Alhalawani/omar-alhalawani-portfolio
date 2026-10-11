import {useLayoutEffect,useMemo} from 'react';
import {BoxGeometry,CanvasTexture,MeshStandardMaterial,SRGBColorSpace,type Texture} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// CPU resources are shared between islands; each renderer owns its GPU upload.
// Delayed release also survives React's mount/cleanup/remount development cycle.
const cache=new Map<string,{value:{dispose:()=>void};users:number;timer?:ReturnType<typeof setTimeout>}>();
export function useResource<T extends {dispose:()=>void}>(key:string,create:()=>T):T {
 const value=useMemo(()=>{let entry=cache.get(key);if(!entry){entry={value:create(),users:0};cache.set(key,entry);}clearTimeout(entry.timer);return entry.value as T;},[key]);
 useLayoutEffect(()=>{const entry=cache.get(key)!;clearTimeout(entry.timer);entry.users++;return()=>{if(--entry.users===0)entry.timer=setTimeout(()=>{if(entry.users===0&&cache.get(key)===entry){entry.value.dispose();cache.delete(key);}},1500);};},[key,value]);
 return value;
}
export function canvasTexture(draw:(ctx:CanvasRenderingContext2D)=>void,size=128,color=false) {
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;draw(canvas.getContext('2d')!);const t=new CanvasTexture(canvas);if(color)t.colorSpace=SRGBColorSpace;return t;
}
export function useSteelGrain(){return useResource('steel-grain',()=>canvasTexture(x=>{x.fillStyle='#b9b9b9';x.fillRect(0,0,128,128);for(let i=0;i<128;i++){const v=160+i*37%70;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(0,i,128,.55);}}));}
export function useGlow(){return useResource('signal-glow',()=>canvasTexture(x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff7dc');g.addColorStop(.1,'#ffd18b');g.addColorStop(.25,'#ffb74a55');g.addColorStop(1,'#ff9c0000');x.fillStyle=g;x.fillRect(0,0,64,64);},64,true));}
export function useMetal(color:string,metalness=.75,roughness=.36,grain?:Texture,emissive=false){return useResource(`material:${color}:${metalness}:${roughness}:${Boolean(grain)}:${emissive}`,()=>new MeshStandardMaterial({color,metalness,roughness,roughnessMap:grain,bumpMap:grain,bumpScale:grain?.009:0,emissive:emissive?'#ffbd59':'#000000',emissiveIntensity:emissive?2.4:0}));}
export function useBox(beveled=false){return useResource(beveled?'beveled-unit-box':'unit-box',()=>beveled?new RoundedBoxGeometry(1,1,1,1,.055):new BoxGeometry());}
export function usePlateGeometry(width:number,height:number,depth:number){return useResource(`plate:${width}:${height}:${depth}`,()=>new RoundedBoxGeometry(width,height,depth,1,Math.min(.04,height/3)));}
