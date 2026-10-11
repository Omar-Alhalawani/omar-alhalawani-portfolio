import {useEffect,useMemo} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector2} from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';

// Emissive energy creates local optical bloom. Mobile keeps the cheaper routed
// cores and additive pulse sprites; the compositor is never loaded on text pages.
export default function EnergyBloom() {
 const {gl,scene,camera,size,invalidate}=useThree();
 const pipeline=useMemo(()=>{
  const composer=new EffectComposer(gl),render=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new Vector2(512,512),.36,.42,1.3),output=new OutputPass(),fxaa=new ShaderPass(FXAAShader);
  composer.setPixelRatio(1);composer.addPass(render);composer.addPass(bloom);composer.addPass(output);composer.addPass(fxaa);
  return {composer,render,bloom,output,fxaa};
 },[gl,scene,camera]);
 useEffect(()=>{pipeline.composer.setSize(size.width*.9,size.height*.9);pipeline.fxaa.uniforms.resolution.value.set(1/(size.width*.9),1/(size.height*.9));invalidate();},[pipeline,size.width,size.height,invalidate]);
 useEffect(()=>{gl.info.autoReset=false;return()=>{gl.info.autoReset=true;};},[gl]);
 useEffect(()=>()=>{pipeline.render.dispose();pipeline.bloom.dispose();pipeline.output.dispose();pipeline.fxaa.dispose();pipeline.composer.dispose();},[pipeline]);
 useFrame(()=>{gl.info.reset();pipeline.composer.render();},1);
 return null;
}
