import {useEffect,useLayoutEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Color,BufferGeometry,Float32BufferAttribute,Group,InstancedMesh,MathUtils,Matrix4,MeshBasicMaterial,MeshStandardMaterial,PointLight,SphereGeometry,TubeGeometry,Vector2,Vector3,CatmullRomCurve3} from 'three';
import {useResource} from './resources';
import type {SceneProps} from './types';
const R=1.72;
const surface=(lat:number,lon:number,r=R)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return new Vector3(r*Math.cos(a)*Math.sin(b),r*Math.sin(a),r*Math.cos(a)*Math.cos(b));};
// Coarse conceptual coastlines; no downloaded map textures or political boundaries.
const lands=[[[ -166,65],[-130,72],[-55,52],[-82,24],[-104,18],[-125,42]], [[-80,12],[-45,-5],[-36,-22],[-68,-55],[-78,-20]], [[-18,35],[35,32],[50,10],[30,-35],[12,-33],[-16,7]], [[-10,36],[-12,60],[40,72],[170,60],[140,30],[115,5],[77,7],[55,28]], [[112,-11],[154,-12],[151,-38],[115,-35]], [[-52,60],[-20,70],[-35,83],[-62,78]]];
function inside(x:number,y:number,p:number[][]){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [a,b]=p[i],[c,d]=p[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;}
function route(from:[number,number],to:[number,number],height:number,sweep=false){const a=surface(...from,1),b=surface(...to,1),points=[];for(let i=0;i<=40;i++){const t=i/40,v=a.clone().lerp(b,t).normalize();if(sweep)v.applyAxisAngle(new Vector3(0,0,1),Math.sin(t*Math.PI)*.48);points.push(v.multiplyScalar(R+.025+Math.sin(t*Math.PI)*height));}return new CatmullRomCurve3(points);}
const paths=[route([45.42,-75.7],[35,70],.48),route([45.42,-75.7],[-30,-50],.27),route([15,-120],[50,30],.73),route([-25,135],[30,-20],.4),route([55,145],[-20,-70],.6),route([-45,-100],[65,100],1.03,true)];
function Arc({index,reducedMotion,pointer}:{index:number;reducedMotion:boolean;pointer:RefObject<Vector2>}){
 const time=useRef(0),band=index%2;
 const geometry=useResource(`contact-route-${index}`,()=>new TubeGeometry(paths[index],48,index===5?.012:.007,5,false));
 const material=useResource(`contact-route-material-${band}`,()=>new MeshStandardMaterial({color:'#8e652e',emissive:'#ff9a25',emissiveIntensity:.85,metalness:.65,roughness:.36}));
 useFrame((_,delta)=>{if(!reducedMotion)time.current+=Math.min(delta,.08);material.emissiveIntensity=reducedMotion?.85:.62+.3*Math.sin(time.current*.16+band*2)**2+(band===0?.14*Math.max(0,1-pointer.current.length()):0);});
 return <mesh geometry={geometry} material={material} dispose={null}/>;
}
export default function ContactGlobeScene({tier,reducedMotion}:SceneProps){
 const globe=useRef<Group>(null),nodes=useRef<InstancedMesh>(null),land=useRef<InstancedMesh>(null),pulses=useRef<InstancedMesh>(null),lights=useRef<(PointLight|null)[]>([]),ottawa=useRef<MeshStandardMaterial>(null),pointer=useRef(new Vector2()),clock=useRef(0),matrix=useMemo(()=>new Matrix4(),[]);
 const {camera,size,gl,invalidate}=useThree();const count=tier==='low'?3:6;const pathIndex=(i:number)=>tier==='low'&&i===2?5:i;
 const dots=useMemo(()=>{const list:Vector3[]=[];for(let lat=-54;lat<78;lat+=tier==='low'?6:4)for(let lon=-178;lon<180;lon+=tier==='low'?6:4)if(lands.some(p=>inside(lon,lat,p)))list.push(surface(lat,lon,R+.008));return list;},[tier]);
 const dotGeometry=useResource('contact-land-dot',()=>new SphereGeometry(.024,5,4)),nodeGeometry=useResource('contact-node',()=>new SphereGeometry(.033,8,6)),pulseGeometry=useResource('contact-pulse',()=>new SphereGeometry(.035,8,6));
 const landMaterial=useResource('contact-land-metal',()=>new MeshStandardMaterial({color:'#536367',metalness:.82,roughness:.46})),nodeMaterial=useResource('contact-node-material',()=>new MeshBasicMaterial({color:'#bc8135'})),pulseMaterial=useResource('contact-pulse-material',()=>new MeshBasicMaterial({color:new Color('#ffca72').multiplyScalar(3.2),toneMapped:false}));
 const grid=useResource('contact-grid',()=>{const vertices:number[]=[];for(let lat=-60;lat<=60;lat+=30)for(let lon=-180;lon<180;lon+=5)vertices.push(...surface(lat,lon,R+.012).toArray(),...surface(lat,lon+5,R+.012).toArray());for(let lon=-180;lon<180;lon+=30)for(let lat=-90;lat<90;lat+=5)vertices.push(...surface(lat,lon,R+.012).toArray(),...surface(lat+5,lon,R+.012).toArray());const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));return g;});
 useLayoutEffect(()=>{dots.forEach((p,i)=>land.current?.setMatrixAt(i,matrix.makeTranslation(p.x,p.y,p.z)));if(land.current)land.current.instanceMatrix.needsUpdate=true;Array.from({length:count},(_,i)=>nodes.current?.setMatrixAt(i,matrix.makeTranslation(...paths[pathIndex(i)].getPoint(1).toArray())));if(nodes.current)nodes.current.instanceMatrix.needsUpdate=true;},[dots,count,matrix]);
 useEffect(()=>{camera.position.set(0,.12,size.width<size.height?9.4:8.3);camera.lookAt(0,0,0);invalidate();const canvas=gl.domElement;const move=(e:PointerEvent)=>{if(reducedMotion||tier==='low'||e.pointerType!=='mouse')return;const b=canvas.getBoundingClientRect();pointer.current.set(MathUtils.clamp((e.clientX-b.left)/b.width*2-1,-1,1),MathUtils.clamp((e.clientY-b.top)/b.height*2-1,-1,1));};const leave=()=>pointer.current.set(0,0);canvas.addEventListener('pointermove',move,{passive:true});canvas.addEventListener('pointerleave',leave);return()=>{canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);};},[camera,size.width,size.height,gl,invalidate,reducedMotion,tier]);
 useFrame((_,delta)=>{const dt=Math.min(delta,.08);if(!reducedMotion)clock.current+=dt;const t=clock.current;if(globe.current){globe.current.rotation.y=MathUtils.damp(globe.current.rotation.y,.86+t*.014+(reducedMotion?0:pointer.current.x*.065),4,dt);globe.current.rotation.x=MathUtils.damp(globe.current.rotation.x,-.16+(reducedMotion?0:pointer.current.y*.055),4,dt);}for(let i=0;i<count;i++){const phase=reducedMotion?.38:(t*(.075+i*.009)+i*.163)%1,activation=reducedMotion?.7:.6+.4*Math.sin(t*.23+i*1.7)**2;for(let j=0;j<4;j++){const p=paths[pathIndex(i)].getPoint((phase-j*.014+1)%1),scale=(1-j*.2)*activation;matrix.makeScale(scale,scale,scale).setPosition(p);pulses.current?.setMatrixAt(i*4+j,matrix);}if(lights.current[i]){lights.current[i]!.position.copy(paths[pathIndex(i)].getPoint(phase));lights.current[i]!.intensity=.8*activation;}}if(pulses.current)pulses.current.instanceMatrix.needsUpdate=true;if(ottawa.current)ottawa.current.emissiveIntensity=reducedMotion?1.1:1.1+Math.sin(t*1.8)*.22+Math.max(0,1-pointer.current.length())*.2;const sample=window.__PORTFOLIO_PROFILE__?.scenes.contact;if(sample)Object.assign(sample,{activePaths:count,landNodes:dots.length,clock:t,rotation:globe.current?.rotation.toArray()});});
 return <group><group ref={globe} rotation={[-.16,.86,0]}>
  <mesh><sphereGeometry args={[R,tier==='low'?40:64,tier==='low'?24:40]}/><meshStandardMaterial color='#111a1e' metalness={.72} roughness={.43}/></mesh>
  <instancedMesh ref={land} args={[dotGeometry,landMaterial,dots.length]} dispose={null}/>
  <lineSegments geometry={grid} dispose={null}><lineBasicMaterial color='#34484e' transparent opacity={.24}/></lineSegments>
  {Array.from({length:count},(_,i)=><Arc key={i} reducedMotion={reducedMotion} pointer={pointer} index={tier==='low'&&i===2?5:i}/>)}
  <instancedMesh ref={nodes} args={[nodeGeometry,nodeMaterial,count]} dispose={null}/>
  <instancedMesh ref={pulses} args={[pulseGeometry,pulseMaterial,count*4]} dispose={null}/>
  {tier!=='low'&&[0,1].map(i=><pointLight key={i} ref={l=>{lights.current[i]=l;}} color='#ffae49' intensity={.4} distance={2} decay={2}/>)}
  <mesh position={surface(45.42,-75.7,R+.035)}><sphereGeometry args={[.057,12,8]}/><meshStandardMaterial ref={ottawa} color='#ffbd59' emissive='#ffad38' emissiveIntensity={1.1}/></mesh>
 </group><directionalLight position={[-3,1,4]} color='#ffbd6a' intensity={1.05}/></group>;
}
