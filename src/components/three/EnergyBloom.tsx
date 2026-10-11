import {useEffect,useMemo} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector2} from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';

// One AA path; the five bloom mips run below CSS resolution, without depth-of-field.
export default function EnergyBloom() {
 const {gl,scene,camera,size,invalidate}=useThree();
 const pipeline=useMemo(()=>{
  const composer=new EffectComposer(gl),render=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new Vector2(256,256),.32,.28,1.5),output=new OutputPass(),fxaa=new ShaderPass(FXAAShader);
  composer.addPass(render);composer.addPass(bloom);composer.addPass(output);composer.addPass(fxaa);
  // Keep the main image crisp; only the glow pyramid is downsampled.
  const sizeBloom=bloom.setSize.bind(bloom);bloom.setSize=(w,h)=>sizeBloom(Math.max(1,Math.round(w*.55)),Math.max(1,Math.round(h*.55)));
  return {composer,render,bloom,output,fxaa};
 },[gl,scene,camera]);
 const ratio=useThree(state=>state.viewport.dpr);
 useEffect(()=>{pipeline.composer.setPixelRatio(ratio);pipeline.composer.setSize(size.width,size.height);pipeline.fxaa.uniforms.resolution.value.set(1/(size.width*ratio),1/(size.height*ratio));invalidate();},[pipeline,ratio,size.width,size.height,invalidate]);
 useEffect(()=>{gl.info.autoReset=false;return()=>{gl.info.autoReset=true;};},[gl]);
 useEffect(()=>()=>{pipeline.render.dispose();pipeline.bloom.dispose();pipeline.output.dispose();pipeline.fxaa.dispose();pipeline.composer.dispose();},[pipeline]);
 useFrame(()=>{gl.info.reset();pipeline.composer.render();},1);
 return null;
}
