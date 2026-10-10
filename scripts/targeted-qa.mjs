import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const server=await startQAServer();const browser=await launchQABrowser();const result=[];
fs.mkdirSync('qa-artifacts',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(server.url,{waitUntil:'networkidle'});
  for(const kind of ['hero','verification','floorplan']){
    const scene=page.locator(`.scene-island[data-scene="${kind}"]`);await scene.scrollIntoViewIfNeeded();await scene.locator('canvas').waitFor();await page.waitForFunction(kind=>document.querySelector(`.scene-island[data-scene="${kind}"]`)?.dataset.state==='ready',kind);await page.waitForTimeout(900);
    await page.screenshot({path:`qa-artifacts/home-${kind}.jpg`,quality:90});
    result.push({scene:kind,ready:true,stats:await scene.locator('canvas').evaluate(canvas=>canvas.dataset)});
  }
  assert.deepEqual(errors,[]);await page.close();
  for(const [width,height,cap] of [[1920,1080,1.75],[1440,900,1.35],[390,844,1]]){
    const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:3});await p.goto(server.url,{waitUntil:'networkidle'});const scene=p.locator('.scene-island').first();await scene.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready');await p.waitForTimeout(150);
    const measurement=await scene.locator('canvas').evaluate(canvas=>({width:canvas.width,cssWidth:canvas.clientWidth,pixelRatio:canvas.width/canvas.clientWidth,tier:canvas.dataset.graphicsTier}));assert.ok(measurement.pixelRatio<=cap+.02);result.push({viewport:[width,height],deviceScaleFactor:3,cap,...measurement});await p.close();
  }
  const noJS=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
  for(const route of ['/','/experience','/projects/fifo','/about','/resume','/contact']){await noJS.goto(server.url+route,{waitUntil:'networkidle'});assert.ok(await noJS.locator('h1').textContent());assert.equal(await noJS.locator('canvas').count(),0);assert.ok(await noJS.locator('a[href="/contact"]').count()>0);}
  result.push({javascriptDisabled:true,routes:6,contentAndNavigation:true});await noJS.close();
  console.log(JSON.stringify(result,null,2));
}finally{fs.writeFileSync('qa-artifacts/targeted-results.json',JSON.stringify(result,null,2));await browser.close();await server.close();}
