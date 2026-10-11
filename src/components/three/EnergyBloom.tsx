import {useEffect,useMemo} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector2} from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';

// Emissive energy creates local optical bloom. Mobile keeps the cheaper routed
// cores and additive pulse sprites; the compositor is never loaded on text pages.
export default function EnergyBloom({cinematic=false}:{cinematic?:boolean}) {
 const {gl,scene,camera,size,invalidate}=useThree();
 const pipeline=useMemo(()=>{
  const composer=new EffectComposer(gl),render=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new Vector2(512,512),.28,.3,1.5),output=new OutputPass(),fxaa=new ShaderPass(FXAAShader);
  const depth=cinematic?new BokehPass(scene,camera,{focus:7.4,aperture:.0025,maxblur:.0035}):null;
  composer.addPass(render);if(depth)composer.addPass(depth);composer.addPass(bloom);composer.addPass(output);composer.addPass(fxaa);
  return {composer,render,depth,bloom,output,fxaa};
 },[gl,scene,camera,cinematic]);
 useEffect(()=>{const ratio=Math.min(1.5,gl.getPixelRatio());pipeline.composer.setPixelRatio(ratio);pipeline.composer.setSize(size.width,size.height);pipeline.fxaa.uniforms.resolution.value.set(1/(size.width*ratio),1/(size.height*ratio));invalidate();},[pipeline,gl,size.width,size.height,invalidate]);
 useEffect(()=>{gl.info.autoReset=false;return()=>{gl.info.autoReset=true;};},[gl]);
 useEffect(()=>()=>{pipeline.render.dispose();pipeline.depth?.dispose();pipeline.bloom.dispose();pipeline.output.dispose();pipeline.fxaa.dispose();pipeline.composer.dispose();},[pipeline]);
 useFrame(()=>{if(pipeline.depth)pipeline.depth.materialBokeh.uniforms.focus.value=Math.max(1,camera.position.length()-.4);gl.info.reset();pipeline.composer.render();},1);
 return null;
}
