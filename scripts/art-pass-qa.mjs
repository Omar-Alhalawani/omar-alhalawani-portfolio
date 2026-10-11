import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const output=process.env.QA_OUTPUT||'qa-artifacts/art-pass';fs.mkdirSync(output,{recursive:true});
const local=process.env.QA_BASE_URL?null:await startQAServer(),base=process.env.QA_BASE_URL||local.url;
const browser=await launchQABrowser(),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],results={base,date:new Date().toISOString(),scenes:[],checks:[],errors};
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};});
if(!process.env.QA_BASE_URL)await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,/webgl/.test(type)?{...options,preserveDrawingBuffer:true}:options);};});
async function ready(kind){const host=page.locator(`.scene-island[data-scene="${kind}"]`);await host.scrollIntoViewIfNeeded();await page.waitForFunction(k=>document.querySelector(`.scene-island[data-scene="${k}"]`)?.dataset.state!=='loading',kind,{timeout:60000});assert.equal(await host.getAttribute('data-state'),'ready');await page.waitForTimeout(700);return host;}
async function capture(name,host){
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 try{await page.screenshot({path:`${output}/${name}.jpg`,quality:91});const bytes=await host.screenshot();fs.writeFileSync(`${output}/${name}-scene.png`,bytes);return bytes;}finally{await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});}
}
async function poster(kind,host){if(process.env.QA_BASE_URL)return;const data=await host.locator('canvas').evaluate(c=>c.toDataURL('image/png'));await sharp(Buffer.from(data.split(',')[1],'base64')).resize({width:1400,withoutEnlargement:true}).flatten({background:'#07090b'}).webp({quality:89}).toFile(`public/art/${kind}-render.webp`);}
try{
 await page.goto(base,{waitUntil:'networkidle'});
 for(const [kind,name,thumb] of [['hero','homepage-hero','engineering'],['verification','verification','verification'],['floorplan','homepage-projects','project']]){
  const host=await ready(kind);if(kind==='hero')await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await poster(kind,host);const bytes=await capture(name,host);results.scenes.push(kind);
  if(!process.env.QA_BASE_URL)await sharp(bytes).resize(640,480,{fit:'contain',background:'#080c0e'}).webp({quality:87}).toFile(`public/images/${thumb}-overview.webp`);
 }
 await page.goto(base+'/projects',{waitUntil:'networkidle'});let host=await ready('floorplan');await capture('projects-world',host);
 await page.locator('[data-project="fpga-arithmetic"]').focus();await page.waitForFunction(()=>document.querySelector('.scene-island canvas')?.dataset.selectedProject==='fpga-arithmetic');assert.ok(await page.locator('[data-preview="fpga-arithmetic"]').isVisible());results.checks.push('HTML keyboard focus updates 3D selection and matching preview');
 await host.scrollIntoViewIfNeeded();await page.waitForTimeout(400);const canvas=host.locator('canvas'),bounds=await canvas.boundingBox(),point=await page.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));await page.mouse.move(bounds.x+point.x,bounds.y+point.y);await page.waitForFunction(()=>document.querySelector('[data-project="fifo"]')?.dataset.active==='true');results.checks.push('Actual 3D pointer hover updates HTML selection');await page.mouse.click(bounds.x+point.x,bounds.y+point.y);await page.waitForURL('**/projects/fifo');results.checks.push('Actual 3D click navigates to FIFO case study');await page.mouse.move(1,1);
 for(const [kind,route] of [['fifo','fifo'],['fpga','fpga-arithmetic'],['emg','emg'],['lumalink','lumalink'],['cubex','cubex']]){
  await page.goto(base+`/projects/${route}`,{waitUntil:'networkidle'});host=await ready(kind);
  if(kind==='fifo'){
   await poster(kind,host);
   await page.locator('#fifo-demo').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Clock one cycle'}).click();await page.getByRole('button',{name:'Clock one cycle'}).click();await page.getByRole('button',{name:'Clock one cycle'}).click();assert.equal(JSON.parse(await page.locator('#fifo-demo').getAttribute('data-state')).count,3);results.checks.push('FIFO cells reflect three accepted writes from existing controls');
   await host.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
  }
  if(kind!=='fifo')await poster(kind,host);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await capture(`${kind}-hero`,host);results.scenes.push(kind);
 }
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await mobile.goto(base,{waitUntil:'networkidle'});await mobile.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready',{},{timeout:60000});assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.screenshot({path:`${output}/mobile-home.jpg`,quality:88});results.checks.push('One representative mobile homepage: ready scene and no horizontal overflow');await mobile.close();
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await reduced.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};});await reduced.goto(base,{waitUntil:'networkidle'});await reduced.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready',{},{timeout:60000});assert.equal(await reduced.locator('.scene-island').first().getAttribute('data-render-loop'),'demand');const before=await reduced.evaluate(()=>JSON.stringify(window.__PORTFOLIO_PROFILE__.scenes.hero.pose));await reduced.waitForTimeout(300);assert.equal(await reduced.evaluate(()=>JSON.stringify(window.__PORTFOLIO_PROFILE__.scenes.hero.pose)),before);await reduced.screenshot({path:`${output}/reduced-motion-home.jpg`,quality:88});results.checks.push('One reduced-motion check: demand rendering and stable hero pose');await reduced.close();assert.deepEqual(errors,[]);
}catch(e){errors.push(e.stack||String(e));process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${output}/art-pass-results.json`,JSON.stringify(results,null,2));await browser.close();await local?.close();console.log(JSON.stringify(results,null,2));}
