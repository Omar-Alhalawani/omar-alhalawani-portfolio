import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const local=process.env.QA_BASE_URL?null:await startQAServer();
const base=process.env.QA_BASE_URL||local.url,output=process.env.QA_OUTPUT||'qa-artifacts/upgrade';
fs.mkdirSync(output,{recursive:true});
const browser=await launchQABrowser();
const result={date:new Date().toISOString(),applicationCommit:process.env.QA_SOURCE_COMMIT||null,base,projectRoutes:[],sharedState:[],touch:[],motion:{},errors:[]};
const ids=['fifo','fpga-arithmetic','lumalink','mini-lysimeter','emg','cubex'];
const faults=[];
const observe=page=>{page.on('pageerror',e=>faults.push(e.message));page.on('console',m=>{if(m.type()==='error')faults.push(m.text());});};
async function ready(page,kind='floorplan'){
 const host=page.locator(`.scene-island[data-scene="${kind}"]`);await host.scrollIntoViewIfNeeded();
 await page.waitForFunction(kind=>document.querySelector(`.scene-island[data-scene="${kind}"]`)?.dataset.state==='ready',kind,{timeout:30000});
 return host.locator('canvas');
}
async function target(canvas,id){
 await canvas.page().waitForFunction(({selector,id})=>JSON.parse(document.querySelector(selector)?.dataset.projectTargets||'[]').some(p=>p.id===id),{selector:'.scene-island[data-scene="floorplan"] canvas',id});
 const p=JSON.parse(await canvas.getAttribute('data-project-targets')).find(p=>p.id===id),box=await canvas.boundingBox();
 return {x:box.x+p.x,y:box.y+p.y};
}
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});observe(page);
 await page.goto(base,{waitUntil:'networkidle'});let canvas=await ready(page,'hero');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 const motion=async()=>JSON.parse(await canvas.getAttribute('data-motion'));
 const idleA=await motion();await page.waitForTimeout(900);const idleB=await motion();
 assert.ok(idleB.time>idleA.time);assert.notDeepEqual(idleA.rotation,idleB.rotation);result.motion.autonomous=true;
 await page.mouse.move(1438,1);await page.waitForTimeout(400);const influence=await motion();assert.ok(influence.pointer[0]>.9);
 for(const [x,y]of [[1,1],[1438,898],[1,898],[1438,1]]){await page.mouse.move(x,y);await page.waitForTimeout(70);}
 assert.ok((await motion()).rotation.every(n=>Number.isFinite(n)&&Math.abs(n)<.5));
 await page.evaluate(()=>document.dispatchEvent(new PointerEvent('pointerout',{relatedTarget:null,bubbles:true})));await page.waitForTimeout(250);assert.deepEqual((await motion()).pointer,[0,0]);
 result.motion.pointerDampedBoundedNeutral=true;
 await page.locator('[data-layer="4"]').focus();await page.locator('[data-layer="4"]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForFunction(()=>JSON.parse(document.querySelector('.scene-island[data-scene="hero"] canvas')?.dataset.motion||'{}').progress>.1);assert.ok((await motion()).progress>.1);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>JSON.parse(document.querySelector('.scene-island[data-scene="hero"] canvas')?.dataset.motion||'{}').progress===0);assert.equal((await motion()).progress,0);
 result.motion.scrollForwardReverse=true;
 await page.screenshot({path:`${output}/hero-desktop.jpg`,quality:90});
 await page.goto(base+'/projects',{waitUntil:'networkidle'});canvas=await ready(page);
 for(const id of ids){await page.locator(`[data-project="${id}"]`).focus();await page.waitForFunction(id=>document.querySelector('.scene-island[data-scene="floorplan"] canvas')?.dataset.selectedProject===id,id);assert.equal(await page.locator(`[data-preview="${id}"]`).isVisible(),true);result.sharedState.push({id,keyboardToWebGL:true});}
 await canvas.scrollIntoViewIfNeeded();
 for(const id of ids){const point=await target(canvas,id);await page.mouse.move(point.x,point.y);console.log('Hover',id,point);await page.waitForFunction(id=>document.querySelector(`[data-project="${id}"]`)?.dataset.active==='true',id,{timeout:3000});assert.equal(await page.locator(`[data-project="${id}"]`).getAttribute('data-active'),'true',`${id} WebGL hover`);assert.equal(await canvas.evaluate(c=>getComputedStyle(c).cursor),'pointer');}
 result.motion.webGLHoverToHTML=true;
 await page.mouse.move(1,1);await page.screenshot({path:`${output}/projects-desktop.jpg`,quality:90});
 for(const id of ids){
   await page.goto(base+'/projects',{waitUntil:'networkidle'});canvas=await ready(page);const point=await target(canvas,id);
   await page.mouse.click(point.x,point.y);await page.waitForURL(base+`/projects/${id}`);assert.match(await page.locator('h1').textContent(),/.+/);
   result.projectRoutes.push({id,path:`/projects/${id}`,actualWebGLPointer:true});
 }
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});observe(mobile);
 await mobile.goto(base+'/projects',{waitUntil:'networkidle'});canvas=await ready(mobile);let point=await target(canvas,'lumalink');
 await mobile.touchscreen.tap(point.x,point.y);await mobile.waitForTimeout(500);assert.equal(mobile.url(),base+'/projects');assert.equal(await mobile.locator('[data-project-world]').getAttribute('data-selected'),'lumalink');
 await mobile.locator('[data-preview="lumalink"] a').click();await mobile.waitForURL(base+'/projects/lumalink');result.touch.push('First tap selects; HTML Open Project navigates');
 await mobile.goto(base+'/projects',{waitUntil:'networkidle'});canvas=await ready(mobile);point=await target(canvas,'fifo');
 await mobile.touchscreen.tap(point.x,point.y);await mobile.waitForTimeout(140);point=await target(canvas,'fifo');await mobile.touchscreen.tap(point.x,point.y);await mobile.waitForURL(base+'/projects/fifo');result.touch.push('Second intentional tap on same module opens its route');
 await mobile.goto(base+'/projects',{waitUntil:'networkidle'});canvas=await ready(mobile);point=await target(canvas,'emg');
 const cdp=await mobile.context().newCDPSession(mobile);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:point.y}]});
 for(let n=1;n<=4;n++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:point.y-n*25}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(500);assert.equal(mobile.url(),base+'/projects');result.touch.push('Dragged touch gesture does not navigate');
 await mobile.goto(base,{waitUntil:'networkidle'});await ready(mobile,'hero');await mobile.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await mobile.screenshot({path:`${output}/hero-mobile.png`});await mobile.close();
 const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});observe(reduced);
 await reduced.goto(base,{waitUntil:'networkidle'});canvas=await ready(reduced,'hero');await reduced.mouse.move(1400,50);const still=JSON.parse(await canvas.getAttribute('data-motion'));await reduced.waitForTimeout(350);const next=JSON.parse(await canvas.getAttribute('data-motion'));assert.equal(still.time,0);assert.equal(next.time,0);assert.deepEqual(next.pointer,[0,0]);assert.equal(await reduced.locator('.scene-island').first().getAttribute('data-render-loop'),'demand');result.motion.reducedStatic=true;await reduced.close();
 assert.deepEqual(faults,[]);result.consoleErrors=0;console.log(JSON.stringify(result,null,2));
}catch(error){result.errors.push(error.stack||String(error));process.exitCode=1;console.error(error);}
finally{fs.writeFileSync(`${output}/upgrade-results.json`,JSON.stringify(result,null,2));await browser.close();await local?.close();}
