import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const output='docs/navigation-pass';fs.mkdirSync(output,{recursive:true});
const server=await startQAServer(),browser=await launchQABrowser();const checks=[],timings=[],errors=[];
async function create(options={}){
 const page=await browser.newPage({viewport:{width:1440,height:900},...options});
 page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR '+page.url()+' '+e.stack);});
 await page.addInitScript(()=>{
  window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};window.__SESSION_TOKEN__=Math.random();
  const active=new Set(),add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener=function(type,listener,options){
   if((this===window||this===document)&&type.startsWith('portfolio:')){
    const existing=[...active].find(x=>x.target===this&&x.type===type&&x.listener===listener);if(!existing){const item={target:this,type,listener};active.add(item);if(options?.signal)add.call(options.signal,'abort',()=>active.delete(item),{once:true});}
   }return add.call(this,type,listener,options);
  };
  EventTarget.prototype.removeEventListener=function(type,listener,options){for(const item of active)if(item.target===this&&item.type===type&&item.listener===listener)active.delete(item);return remove.call(this,type,listener,options);};
  window.__NAV_LISTENERS__=()=>active.size;
 });return page;
}
async function ready(page,kind){const host=page.locator(`.scene-island[data-scene="${kind}"]`);await host.scrollIntoViewIfNeeded();await page.waitForFunction(kind=>document.querySelector(`.scene-island[data-scene="${kind}"]`)?.dataset.state==='ready',kind,{timeout:60000});return host;}
async function clientLink(page,locator,path){const token=await page.evaluate(()=>window.__SESSION_TOKEN__);await locator.click();await page.waitForURL('**'+path);assert.equal(await page.evaluate(()=>window.__SESSION_TOKEN__),token,'Full document reload');}
const page=await create();
try{
 await page.goto(server.url+'/projects',{waitUntil:'networkidle'});let host=await ready(page,'floorplan');const token=await page.evaluate(()=>window.__SESSION_TOKEN__),stress=[];
 for(const [id,kind] of [['fifo','fifo'],['fpga-arithmetic','fpga'],['lumalink','lumalink'],['cubex','cubex']].filter(([id])=>process.env.NAV_CHECK!=='finish'&&(!process.env.NAV_PROJECT||process.env.NAV_PROJECT===id))){
  host=await ready(page,'floorplan');await page.mouse.move(1,1);await page.waitForTimeout(200);
  const bounds=await host.locator('canvas').boundingBox(),point=await page.evaluate(id=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id===id),id);
  await page.mouse.move(bounds.x+point.x,bounds.y+point.y);
  await page.waitForFunction(id=>performance.getEntriesByName(`project:prefetch:${id}`).length>0,id,{timeout:10000});
  const scroll=await page.evaluate(()=>scrollY);await page.evaluate(()=>performance.clearMarks());
  await page.mouse.click(bounds.x+point.x,bounds.y+point.y);await page.waitForURL('**/projects/'+id,{timeout:15000});
  assert.equal(await page.evaluate(()=>window.__SESSION_TOKEN__),token);
  assert.equal(await page.evaluate(()=>window.__PROJECT_HANDOFF__?.id),id);
  assert.equal(await page.locator('#project-handoff canvas').count(),1);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('portfolio:project-handoff')),null);
  assert.ok(await page.evaluate(()=>{const canvas=window.__PROJECT_HANDOFF__.frame,data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;for(let i=0;i<data.length;i+=64)if(data[i]>15||data[i+1]>15||data[i+2]>15)return true;return false;}),'Retained picture is blank');
  assert.ok(await page.evaluate(()=>scrollY<50),'Project entry must start at top');
  if(id==='fifo'&&process.env.NAV_CAPTURE==='1')await page.screenshot({path:output+'/fifo-retained.jpg',quality:85});
  while(await page.locator(`.scene-island[data-scene="${kind}"]`).getAttribute('data-state')!=='ready'){assert.equal(await page.locator('#project-handoff').count(),1,'Handoff disappeared before the first valid frame');await page.waitForTimeout(100);}
  await ready(page,kind);await page.waitForFunction(()=>!document.querySelector('#project-handoff'),{},{timeout:8000});
  assert.equal(await page.locator('canvas').count(),1);
  const timing=await page.evaluate(({id,kind})=>{const mark=name=>performance.getEntriesByName('project:'+name).at(-1)?.startTime;return{id,cameraEndToSwapMs:mark('route-swap')-mark('camera-end'),swapToFirstFrameMs:window.__PORTFOLIO_PROFILE__.scenes[kind].firstFrameMs-mark('route-swap'),captureMs:window.__PORTFOLIO_PROFILE__.scenes.floorplan.captureMs,marks:performance.getEntriesByType('mark').filter(m=>m.name.startsWith('project:')).map(m=>({name:m.name,time:m.startTime}))};},{id,kind});timings.push(timing);
  if(id==='fifo'){
   await page.locator('#fifo-demo').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Clock one cycle'}).click();assert.equal(await page.locator('#fifo-demo').evaluate(e=>JSON.parse(e.dataset.state).count),1);
   await page.locator('.case-toc a').first().click();await page.waitForTimeout(200);assert.equal(await page.locator('.case-toc a[aria-current="location"]').count(),1);checks.push('FIFO demo and current-section observer work after client entry');
  }
  if(id==='fpga-arithmetic'){
   await page.locator('#fpga-demo').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Load A',exact:true}).click();assert.equal(await page.locator('#fpga-demo').evaluate(e=>JSON.parse(e.dataset.state).a),21);checks.push('FPGA demo works after client entry');
  }
  // Back restores the preceding Projects history entry even after anchor navigation.
  if(page.url().includes('#'))await page.goBack();
  await page.goBack();await page.waitForURL('**/projects');host=await ready(page,'floorplan');await page.mouse.move(1,1);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>window.__SESSION_TOKEN__),token);assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('#project-handoff').count(),0);assert.equal(await page.locator('[data-project-world]').getAttribute('data-selected'),id);assert.equal(await host.locator('canvas').getAttribute('data-transition'),'idle');
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<160,'Back scroll restoration');
  stress.push(await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,listeners:window.__NAV_LISTENERS__(),heap:performance.memory?.usedJSHeapSize})));console.log('Client world / Back: '+id);fs.writeFileSync(output+(process.env.NAV_CHECK==='timing'?'/timings.json':process.env.NAV_CHECK==='finish'?'/finish.json':'/results.json'),JSON.stringify({renderer:'ANGLE SwiftShader; local immutable production build',timings,stress,checks,errors},null,2)+'\n');
 }
 assert.ok(stress.every(s=>s.canvases===1));assert.ok(stress.every(s=>s.listeners===stress[0].listeners),'Global portfolio listeners multiplied');if(stress.length)checks.push(`${stress.length}-route stress loop: same document, one canvas, stable global listeners, no overlay/lock, selection and Back scroll restored`);
 if(process.env.NAV_CHECK!=='timing'){
 await clientLink(page,page.locator('[data-project="fpga-arithmetic"]'),'/projects/fpga-arithmetic');await ready(page,'fpga');const next=await page.locator('.project-pagination a').last().getAttribute('href');await clientLink(page,page.locator('.project-pagination a').last(),next);await clientLink(page,page.locator('.case-back'),'/projects');checks.push('FPGA → Next Project and Project → All Projects use client swaps');
 await clientLink(page,page.locator('.site-header .brand'),'/');await page.locator('[data-layer="1"]').click();assert.equal(await page.locator('[data-layer="1"]').getAttribute('aria-pressed'),'true');await clientLink(page,page.locator('.desktop-nav a[href="/projects"]'),'/projects');checks.push('Home Technical Focus reinitializes; Home → Projects uses client navigation');
 let submissions=0;await page.route('https://formspree.io/**',route=>{submissions++;return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
 await clientLink(page,page.locator('.desktop-nav a[href="/contact"]'),'/contact');await page.locator('[name="name"]').fill('Navigation QA');await page.locator('[name="email"]').fill('qa@example.invalid');await page.locator('[name="message"]').fill('Mocked local navigation test; never delivered.');await page.getByRole('button',{name:'Send message'}).click();await page.waitForFunction(()=>document.querySelector('#form-status')?.dataset.state==='success');assert.equal(submissions,1);await clientLink(page,page.locator('.desktop-nav a[href="/projects"]'),'/projects');checks.push('Projects → Contact → Projects; exactly one mocked submission, no email sent');
 const reduced=await create({reducedMotion:'reduce'});await reduced.goto(server.url+'/projects?graphics=static');const reducedToken=await reduced.evaluate(()=>window.__SESSION_TOKEN__);await clientLink(reduced,reduced.locator('[data-project="fifo"]'),'/projects/fifo');assert.equal(await reduced.evaluate(()=>window.__SESSION_TOKEN__),reducedToken);assert.equal(await reduced.locator('#project-handoff').count(),0);await reduced.close();checks.push('Reduced motion uses immediate client navigation without handoff');
 const fallback=await create();await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return /webgl/.test(type)?null:get.call(this,type,options);};});await fallback.goto(server.url+'/projects');await fallback.locator('.platform-canvas').scrollIntoViewIfNeeded();await fallback.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='fallback');await clientLink(fallback,fallback.locator('[data-project="fifo"]'),'/projects/fifo');assert.equal(await fallback.locator('#project-handoff').count(),0);await fallback.close();checks.push('Unavailable WebGL: normal client links, no fake camera or stale overlay');
 const mobile=await create({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await mobile.goto(server.url+'/projects');const mh=await ready(mobile,'floorplan');let box=await mh.locator('canvas').boundingBox(),target=await mobile.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));await mobile.touchscreen.tap(box.x+target.x,box.y+target.y);assert.ok(mobile.url().endsWith('/projects'));await mobile.waitForTimeout(300);target=await mobile.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id==='fifo'));const mobileToken=await mobile.evaluate(()=>window.__SESSION_TOKEN__);await mobile.touchscreen.tap(box.x+target.x,box.y+target.y);await mobile.waitForURL('**/projects/fifo');assert.equal(await mobile.evaluate(()=>window.__SESSION_TOKEN__),mobileToken);await ready(mobile,'fifo');await mobile.waitForFunction(()=>!document.querySelector('#project-handoff'));await mobile.close();checks.push('Mobile touch: select then open, client swap and handoff cleanup');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(output+(process.env.NAV_CHECK==='timing'?'/timings.json':process.env.NAV_CHECK==='finish'?'/finish.json':'/results.json'),JSON.stringify({renderer:'ANGLE SwiftShader; local immutable production build',timings,stress,checks,errors},null,2)+'\n');console.log(JSON.stringify({timings,stress,checks},null,2));
}catch(e){console.error(e);console.log(await page.evaluate(()=>({url:location.href,handoff:!!window.__PROJECT_HANDOFF__,marks:performance.getEntriesByType('mark').map(m=>({name:m.name,time:m.startTime})),states:[...document.querySelectorAll('.scene-island')].map(e=>({scene:e.dataset.scene,state:e.dataset.state,loop:e.dataset.renderLoop}))})));process.exitCode=1;}finally{await browser.close();await server.close();}
