import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const output='docs/transition-review';fs.mkdirSync(output,{recursive:true});
const server=await startQAServer(),browser=await launchQABrowser();
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];let diagnostic=page;
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};});
async function ready(kind){const host=page.locator(`.scene-island[data-scene="${kind}"]`);await host.scrollIntoViewIfNeeded();await page.waitForFunction(k=>document.querySelector(`.scene-island[data-scene="${k}"]`)?.dataset.state==='ready',kind,{timeout:45000});await page.waitForTimeout(250);return host;}
const bytes=image=>Buffer.from(image.split(',')[1],'base64');
async function tile(buffer,title){const image=await sharp(buffer).resize(720,450,{fit:'contain',background:'#07090b'}).jpeg({quality:85}).toBuffer();const label=Buffer.from(`<svg width="720" height="34"><rect width="720" height="34" fill="#13191c"/><text x="16" y="22" font-family="sans-serif" font-size="14" fill="#ffbd59">${title}</text></svg>`);return sharp({create:{width:720,height:484,channels:3,background:'#07090b'}}).composite([{input:image,top:34,left:0},{input:label,top:0,left:0}]).png().toBuffer();}
try{
 for(const [id,kind] of [['fifo','fifo'],['fpga-arithmetic','fpga'],['lumalink','lumalink'],['cubex','cubex']].filter(([id])=>!process.env.TRANSITION_CASE||id===process.env.TRANSITION_CASE)){
  await page.goto(server.url+'/projects',{waitUntil:'networkidle'});const host=await ready('floorplan');await page.mouse.move(1,1);await page.waitForTimeout(200);
  if(id==='fifo'){
   await page.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts?.every(m=>m.y===m.restY));checks.push('All six modules rest on their mounts; default FIFO selection does not lift it.');
  }
  const before=await page.screenshot(),canvas=host.locator('canvas'),bounds=await canvas.boundingBox();
  let point=await page.evaluate(id=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id===id),id);
  await page.mouse.move(bounds.x+point.x,bounds.y+point.y);await page.waitForTimeout(300);
  if(id==='fifo'){
   await page.waitForFunction(()=>{const m=window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts.find(m=>m.id==='fifo');return Math.abs(m.y-m.restY-.22)<.001;},{},{timeout:12000});
   await page.mouse.move(1,1);await page.waitForFunction(()=>{const m=window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts.find(m=>m.id==='fifo');return m.y===m.restY;},{},{timeout:12000});checks.push('FIFO actual mouse hover retains +0.22; pointer exit returns to exact rest.');
   point=await page.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));await page.mouse.move(bounds.x+point.x,bounds.y+point.y);await page.waitForTimeout(250);
  }
  const began=Date.now();await page.mouse.click(bounds.x+point.x,bounds.y+point.y);
  await page.waitForURL(`**/projects/${id}`,{waitUntil:'domcontentloaded',timeout:20000});
  const elapsed=Date.now()-began,handoff=await page.evaluate(()=>window.__PROJECT_HANDOFF__);
  assert.equal(handoff?.id,id,`${id}: final frame handoff missing`);assert.ok(handoff.midFrame,`${id}: no rendered midpoint`);
  const first=await page.screenshot();
  await ready(kind);await page.waitForFunction(()=>!document.getElementById('project-handoff'),{},{timeout:8000});
  assert.equal(await page.locator('canvas').count(),1);
  const frames=await Promise.all([tile(before,'Project platform before click'),tile(bytes(handoff.midFrame),'Actual camera push: middle frame'),tile(bytes(handoff.image),'Actual camera push: final frame'),tile(first,'Destination first frame: retained WebGL picture')]);
  await sharp({create:{width:1440,height:968,channels:3,background:'#07090b'}}).composite(frames.map((input,i)=>({input,left:(i%2)*720,top:Math.floor(i/2)*484}))).jpeg({quality:87}).toFile(`${output}/${id}.jpg`);
  checks.push(`${id}: real 3D click, midpoint/final/entry captures, destination ready; click-to-DOM ${elapsed} ms on SwiftShader.`);
  const back=page.getByRole('link',{name:'← All projects',exact:true});await back.click();await page.waitForURL('**/projects');await ready('floorplan');assert.equal(await page.locator('[data-project-world]').getAttribute('data-selected'),id);assert.equal(await page.locator('canvas').count(),1);
  console.log('Checked '+id);
 }
 await page.close();
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});diagnostic=reduced;await reduced.goto(server.url+'/projects',{waitUntil:'networkidle'});await reduced.locator('[data-project="fifo"]').focus();await reduced.keyboard.press('Enter');await reduced.waitForURL('**/projects/fifo');assert.equal(await reduced.evaluate(()=>Boolean(window.__PROJECT_HANDOFF__)),false);await reduced.close();checks.push('Reduced-motion keyboard Enter navigates without camera fly-in.');
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});diagnostic=mobile;mobile.on('pageerror',error=>errors.push(error.message));await mobile.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};});await mobile.goto(server.url+'/projects',{waitUntil:'networkidle'});const host=mobile.locator('.scene-island[data-scene="floorplan"]');await host.scrollIntoViewIfNeeded();await mobile.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready',{},{timeout:45000});const box=await host.locator('canvas').boundingBox();let target=await mobile.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));await mobile.touchscreen.tap(box.x+target.x,box.y+target.y);assert.ok(mobile.url().endsWith('/projects'));await mobile.waitForTimeout(350);target=await mobile.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));await mobile.touchscreen.tap(box.x+target.x,box.y+target.y);await mobile.waitForURL('**/projects/fifo');assert.equal(await mobile.evaluate(()=>window.__PROJECT_HANDOFF__?.id),'fifo');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.close();checks.push('390×844 touch: first tap selects, second tap opens; frame handoff and no horizontal overflow.');
 assert.deepEqual(errors,[]);
}catch(error){errors.push(error.stack||String(error));process.exitCode=1;console.error(error);if(!diagnostic.isClosed()){console.log(await diagnostic.evaluate(()=>({sample:window.__PORTFOLIO_PROFILE__?.scenes.floorplan,active:document.activeElement?.outerHTML.slice(0,300),loop:document.querySelector('.scene-island')?.dataset.renderLoop})));await diagnostic.screenshot({path:output+'/failure.jpg'});} }finally{
 fs.writeFileSync(`${output}/checks.json`,JSON.stringify({renderer:'Playwright / ANGLE SwiftShader (software rendering; not hardware FPS validation)',checks,errors},null,2));await browser.close();await server.close();console.log(JSON.stringify({checks,errors},null,2));
}
