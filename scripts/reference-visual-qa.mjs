import fs from 'node:fs';
import sharp from 'sharp';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const local=process.env.QA_BASE_URL?null:await startQAServer(),base=process.env.QA_BASE_URL||local.url;
const output=process.env.QA_OUTPUT||'qa-artifacts/corrective/visual';fs.mkdirSync(output,{recursive:true});
const browser=await launchQABrowser(),page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
// Freeze an already-rendered ordinary animation frame during capture. This
// avoids software-GPU contention without changing materials or composition.
async function capture(action){
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 try{return await action();}finally{await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});}
}
try{
 await page.goto(base,{waitUntil:'networkidle'});
 for(const [kind,asset] of [['hero','engineering'],['verification','verification'],['floorplan','project']]){
  const scene=page.locator(`.scene-island[data-scene="${kind}"]`);await scene.scrollIntoViewIfNeeded();await page.waitForFunction(k=>document.querySelector(`.scene-island[data-scene="${k}"]`)?.dataset.state==='ready',kind);
  if(kind==='hero')await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(1800);const bytes=await capture(async()=>{await page.screenshot({path:`${output}/home-${kind}.png`});return await scene.screenshot();});fs.writeFileSync(`${output}/${asset}-canvas.png`,bytes);
  if(process.env.QA_WRITE_OVERVIEW==='1'&&!process.env.QA_BASE_URL)await sharp(bytes).resize(640,480,{fit:'contain',background:'#080c0e'}).webp({quality:85}).toFile(`public/images/${asset}-overview.webp`);
  if(kind==='hero'){await page.locator('#engineering-stack').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);await capture(()=>page.screenshot({path:`${output}/technical-focus.png`}));}
 }
 await page.goto(base+'/projects',{waitUntil:'networkidle'});await page.locator('.scene-island').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready');await page.waitForTimeout(1400);await capture(()=>page.screenshot({path:`${output}/projects.png`}));
 await page.goto(base+'/projects/fifo',{waitUntil:'networkidle'});await page.locator('.scene-island').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1600);await capture(()=>page.screenshot({path:`${output}/fifo-hero.png`}));
 await page.locator('#architecture').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/fifo-architecture.png`});
 await page.locator('#simulation-evidence').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/fifo-evidence.png`});
 await page.goto(base,{waitUntil:'networkidle'});const overview=page.locator('.engineering-overview');if(await overview.count()){await overview.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:`${output}/overview.png`});}
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(base,{waitUntil:'networkidle'});await mobile.screenshot({path:`${output}/home-mobile.png`});await mobile.close();
 fs.writeFileSync(`${output}/visual-results.json`,JSON.stringify({date:new Date().toISOString(),base,applicationCommit:process.env.QA_SOURCE_COMMIT||null,errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();await local?.close();}
