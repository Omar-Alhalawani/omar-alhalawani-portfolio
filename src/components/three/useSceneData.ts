import {useEffect,useState} from 'react';
import {useThree} from '@react-three/fiber';

export function useSceneData<T>(id:string,eventName:string,initial:T) {
  const [state,setState]=useState<T>(initial);
  const {invalidate}=useThree();
  useEffect(()=>{
    const value=document.getElementById(id)?.dataset.state;
    if(value) {try{setState(JSON.parse(value) as T);}catch{/* Keep the documented initial state. */}}
    const receive=(event:Event)=>{setState((event as CustomEvent<T>).detail);invalidate();};
    window.addEventListener(eventName,receive);invalidate();
    return()=>window.removeEventListener(eventName,receive);
  },[id,eventName,invalidate]);
  return state;
}

export function useSceneCamera(kind:'floorplan'|'detail'='detail') {
  const {camera,invalidate,size}=useThree();
  useEffect(()=>{
    const fit=Math.max(1,1.2/(size.width/size.height));
    if(kind==='floorplan')camera.position.set(0,3.8*fit,6.7*fit);else camera.position.set(0,2.7*fit,6.2*fit);
    camera.lookAt(0,.1,0);invalidate();
  },[camera,invalidate,kind,size.width,size.height]);
}
