import fs from 'node:fs';
import { launchQABrowser, startQAServer } from './qa-runtime.mjs';

fs.mkdirSync('qa-artifacts',{recursive:true});
const server=await startQAServer();
const browser=await launchQABrowser();
const results=[];
try {
  for(const [width,height] of [[1440,900],[320,568],[390,844],[768,1024]]) {
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto(server.url,{waitUntil:'networkidle'});
    await page.locator('.scene-island[data-state="ready"]').waitFor({timeout:20000});
    await page.waitForTimeout(1100);
    await page.screenshot({path:`qa-artifacts/prototype-${width}.png`});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(width===1440) {
      await page.locator('#engineering-stack').scrollIntoViewIfNeeded();
      await page.locator('[data-layer="2"]').focus();
      await page.waitForTimeout(1100);
      await page.screenshot({path:'qa-artifacts/prototype-layers.png'});
    }
    results.push({width,height,overflow,errors,scene:await page.locator('.scene-island').getAttribute('data-state')});
    await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await reduced.goto(server.url,{waitUntil:'networkidle'});
  await reduced.locator('.scene-island[data-state="ready"]').waitFor();
  await reduced.screenshot({path:'qa-artifacts/prototype-reduced.png'});
  results.push({reducedMotion:true,ready:true});
  await reduced.close();
  const fallback=await browser.newPage({viewport:{width:390,height:844}});
  await fallback.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:original.call(this,type,...args);};
  });
  await fallback.goto(server.url,{waitUntil:'networkidle'});
  await fallback.locator('.scene-island[data-state="fallback"]').waitFor();
  await fallback.screenshot({path:'qa-artifacts/prototype-fallback.png'});
  results.push({webglUnavailable:true,fallback:true});
  await fallback.close();
  fs.writeFileSync('qa-artifacts/prototype-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  if(results.some(result=>result.overflow||result.errors?.length))process.exitCode=1;
} finally {await browser.close();await server.close();}
