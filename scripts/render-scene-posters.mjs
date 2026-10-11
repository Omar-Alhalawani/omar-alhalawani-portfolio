import fs from 'node:fs';
import sharp from 'sharp';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const server=await startQAServer(),browser=await launchQABrowser(),page=await browser.newPage({viewport:{width:1440,height:900}});
// Buffer preservation is confined to this asset-export browser. The application
// and performance tests retain the normal renderer configuration.
await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,/webgl/.test(type)?{...options,preserveDrawingBuffer:true}:options);};});
try{
 const routes=[['hero','/'],['verification','/'],['floorplan','/'],['fifo','/projects/fifo'],['fpga','/projects/fpga-arithmetic'],['emg','/projects/emg'],['lumalink','/projects/lumalink'],['cubex','/projects/cubex'],['daq','/projects/mini-lysimeter']];
 let current;
 for(const [kind,route] of routes){
  if(current!==route){await page.goto(server.url+route,{waitUntil:'networkidle'});current=route;}
  const scene=page.locator(`.scene-island[data-scene="${kind}"]`);await scene.scrollIntoViewIfNeeded();await page.waitForFunction(k=>document.querySelector(`.scene-island[data-scene="${k}"]`)?.dataset.state==='ready',kind);
  if(kind==='hero')await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(1600);
  const data=await scene.locator('canvas').evaluate(c=>c.toDataURL('image/png'));
  const bytes=Buffer.from(data.split(',')[1],'base64');
  await sharp(bytes).resize({width:1200,withoutEnlargement:true}).flatten({background:'#07090b'}).webp({quality:87}).toFile(`public/art/${kind}-render.webp`);
  const info=await sharp(`public/art/${kind}-render.webp`).metadata();if(!info.width||!info.height)throw new Error(`${kind}: empty export`);
  console.log(JSON.stringify({scene:kind,width:info.width,height:info.height,bytes:fs.statSync(`public/art/${kind}-render.webp`).size}));
 }
}finally{await browser.close();await server.close();}
