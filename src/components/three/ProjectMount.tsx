import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {Box3,Group,Vector3} from 'three';
export type ProjectDock={id:string;dockWidth:number;dockDepth:number;modelScale:number};
export type ModelMount={offset:[number,number,number];size:[number,number,number];rawMin:[number,number,number];rawMax:[number,number,number];fits:boolean;marginX:number;marginZ:number};
const MOUNT_TOP=.122,EDGE_MARGIN=.08;
export default function ProjectMount({dock,onMeasure,children}:{dock:ProjectDock;onMeasure:(id:string,mount:ModelMount)=>void;children:ReactNode}) {
 const model=useRef<Group>(null),[mount,setMount]=useState<ModelMount|null>(null);
 useLayoutEffect(()=>{
  if(!model.current)return;
  // Detached identity clone measures every physical child, including instanced
  // controls, rails and labels, without the platform's world rotation or lift.
  const copy=model.current.clone(true);copy.position.set(0,0,0);copy.rotation.set(0,0,0);copy.scale.setScalar(1);copy.updateMatrixWorld(true);
  // Sprite halos are illumination, not physical parts. Line2's render vertices
  // are unit extrusion quads; its geometry bounding box holds the actual route.
  const halos:Group['children']=[];copy.traverse(object=>{if(object.type==='Sprite')halos.push(object);});halos.forEach(object=>object.removeFromParent());
  const box=new Box3().setFromObject(copy,false),center=box.getCenter(new Vector3()),rawSize=box.getSize(new Vector3()),s=dock.modelScale;
  const size=rawSize.multiplyScalar(s),marginX=(dock.dockWidth-size.x)/2,marginZ=(dock.dockDepth-size.z)/2;
  const measured:ModelMount={offset:[-center.x*s,MOUNT_TOP-box.min.y*s,-center.z*s],size:size.toArray(),rawMin:box.min.toArray(),rawMax:box.max.toArray(),marginX,marginZ,fits:marginX>=dock.dockWidth*EDGE_MARGIN-.002&&marginZ>=dock.dockDepth*EDGE_MARGIN-.002};
  model.current.position.set(...measured.offset);onMeasure(dock.id,measured);setMount(measured);
  const p=window.__PORTFOLIO_PROFILE__;
  if(p){const sample=p.scenes.floorplan??={};(sample.footprints??={})[dock.id]={...measured,dockWidth:dock.dockWidth,dockDepth:dock.dockDepth,modelScale:s};}
  if(import.meta.env.DEV&&!measured.fits)console.error(`[project footprint] ${dock.id} exceeds its dock margin`,measured);
 },[dock,onMeasure]);
 const debug=import.meta.env.DEV&&new URLSearchParams(location.search).has('footprints');
 return <group>
  <group ref={model} scale={dock.modelScale}>{children}</group>
  {debug&&mount&&<>
   <mesh position={[0,MOUNT_TOP+.005,0]}><boxGeometry args={[dock.dockWidth,.01,dock.dockDepth]}/><meshBasicMaterial wireframe color='#68b9ff'/></mesh>
   <mesh position={[0,MOUNT_TOP+mount.size[1]/2,0]}><boxGeometry args={mount.size}/><meshBasicMaterial wireframe color={mount.fits?'#63ff94':'#ff516d'}/></mesh>
   <axesHelper args={[.3]}/><axesHelper args={[.2]} position={[0,MOUNT_TOP+mount.size[1]/2,0]}/>
  </>}
 </group>;
}
