import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const viewports=[[1280,720],[1366,768],[1440,900],[1920,1080],[2560,1440],[320,568],[375,812],[390,844],[430,932],[768,1024],[3440,1440],[844,390]];
const routes=['/','/experience','/projects','/projects/fifo','/projects/fpga-arithmetic','/projects/emg','/projects/lumalink','/projects/cubex','/projects/mini-lysimeter','/about','/resume','/contact','/missing-signal'];
const artifactDirectory=process.env.QA_OUTPUT||'qa-artifacts';fs.mkdirSync(artifactDirectory,{recursive:true});
const local=process.env.QA_BASE_URL?null:await startQAServer();
const base=process.env.QA_BASE_URL||local.url;
const behaviorOnly=process.env.QA_BEHAVIOR_ONLY==='1';
const browser=await launchQABrowser();
const result={date:new Date().toISOString(),applicationCommit:process.env.QA_SOURCE_COMMIT||null,base,scope:behaviorOnly?'behavior':'full',renderer:'Chromium 153 / software WebGL in managed QA environment',matrix:[],accessibility:[],checks:[],errors:[]};
const axeSource=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const slug=route=>route==='/'?'home':route.replaceAll('/','-').slice(1);
function watch(page){
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(base)&&!response.url().endsWith('/missing-signal'))errors.push(`HTTP ${response.status()} ${response.url()}`);});
  page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')errors.push(`${request.failure()?.errorText}: ${request.url()}`);});
  return errors;
}
async function ready(page){
  const scenes=page.locator('.scene-island');
  if(await scenes.count()){
    await scenes.first().scrollIntoViewIfNeeded();
    await scenes.first().locator('canvas').waitFor({timeout:20000});
    await page.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready',{timeout:20000});
    await page.waitForTimeout(180);
  }
}
async function verifyLayout(page){
  const measurement=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1')?.textContent,brokenImages:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),canvases:document.querySelectorAll('canvas').length}));
  assert.equal(measurement.overflow,false,`${page.url()}: horizontal overflow`);assert.ok(measurement.heading);assert.deepEqual(measurement.brokenImages,[]);
  return measurement;
}
try{
  // Every requested size plus ultrawide and landscape; all routes at the
  // smallest mobile, tablet, and standard desktop sizes.
  if(!behaviorOnly)for(const [width,height] of viewports){
    const selected=[320,768,1440].includes(width)?routes:['/','/projects','/projects/fifo','/projects/fpga-arithmetic','/contact'];
    const page=await browser.newPage({viewport:{width,height}});
    const errors=watch(page);
    for(const route of selected){
      const mark=errors.length;
      const response=await page.goto(base+route,{waitUntil:'networkidle'});
      assert.equal(response.status(),route==='/missing-signal'?404:200);
      await ready(page);
      const measurement=await verifyLayout(page);
      const graphics=await page.locator('canvas').evaluateAll(canvases=>canvases.map(canvas=>({...canvas.dataset,width:canvas.width,height:canvas.height})));
      if(width===1440||width===320||width===390){
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(750);
        await page.screenshot({path:`${artifactDirectory}/${slug(route)}-${width}.png`});
      }
      // HTTP/2 may omit the reason phrase that the local HTTP/1.1 server sends.
      // Asset failures still receive their own URL-specific response error.
      const unexpected=errors.slice(mark).filter(error=>!(route==='/missing-signal'&&/^Failed to load resource: the server responded with a status of 404 \(.*\)$/.test(error)));
      assert.deepEqual(unexpected,[],`${route} at ${width}: console/network errors`);
      result.matrix.push({route,width,height,status:response.status(),...measurement,graphics});
      console.log(`PASS ${width}×${height} ${route}`);
    }
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=watch(page);
  if(!behaviorOnly)for(const route of routes.filter(route=>route!=='/missing-signal')){
    await page.goto(base+route,{waitUntil:'networkidle'});await ready(page);await page.addScriptTag({content:axeSource});
    const audit=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)})),passes:r.passes.length};});
    result.accessibility.push({route,...audit});assert.deepEqual(audit.violations,[],`${route}: axe violations`);
    console.log(`PASS AXE ${route}`);
  }
  await page.goto(base,{waitUntil:'networkidle'});await ready(page);
  await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'main');
  await page.locator('[data-layer="4"]').focus();assert.equal(await page.locator('[data-layer="4"]').getAttribute('aria-pressed'),'true');
  for(const y of [300,600,1000,1600,500,2400,7000,0]){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(120);}
  await verifyLayout(page);assert.equal(await page.locator('.scene-island[data-scene="hero"]').getAttribute('data-state'),'ready');
  const hero=page.locator('.scene-island[data-scene="hero"]');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(state=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.renderLoop===state,'always');assert.equal(await hero.getAttribute('data-render-loop'),'always');
  await page.evaluate(()=>window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.waitForFunction(state=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.renderLoop===state,'paused');assert.equal(await hero.getAttribute('data-render-loop'),'paused');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(state=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.renderLoop===state,'always');assert.equal(await hero.getAttribute('data-render-loop'),'always');
  // Emulate the document visibility API to deterministically inspect the
  // application's pause/resume contract; this is not a physical-tab benchmark.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(state=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.renderLoop===state,'paused');assert.equal(await hero.getAttribute('data-render-loop'),'paused');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(state=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.renderLoop===state,'always');assert.equal(await hero.getAttribute('data-render-loop'),'always');
  for(const [width,height] of [[390,844],[1920,1080],[768,1024],[1440,900]]){await page.setViewportSize({width,height});await page.waitForTimeout(200);await verifyLayout(page);}
  result.checks.push('Keyboard skip link and skill focus; slow/fast/reverse scroll; offscreen pause/resume; emulated document visibility; live resize');
  await page.goto(base+'/projects',{waitUntil:'networkidle'});await ready(page);await page.locator('[data-project="emg"]').focus();assert.equal(await page.locator('[data-project="emg"]').getAttribute('data-active'),'true');
  await page.screenshot({path:`${artifactDirectory}/projects-focus.png`});
  await page.goto(base+'/projects/fifo',{waitUntil:'networkidle'});await page.locator('#fifo-demo').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Clock one cycle'}).click();assert.equal((await page.locator('#fifo-demo').getAttribute('data-state')&&JSON.parse(await page.locator('#fifo-demo').getAttribute('data-state'))).count,1);
  await page.getByLabel('rd_ready').check();await page.getByRole('button',{name:'Clock one cycle'}).click();let state=JSON.parse(await page.locator('#fifo-demo').getAttribute('data-state'));assert.equal(state.count,1);assert.equal(state.output,161);
  await page.getByLabel('wr_valid').uncheck();await page.getByRole('button',{name:'Clock one cycle'}).click();state=JSON.parse(await page.locator('#fifo-demo').getAttribute('data-state'));assert.equal(state.count,0);
  await page.getByRole('button',{name:'Reset + clock'}).click();await page.screenshot({path:`${artifactDirectory}/fifo-model.png`});
  await page.goto(base+'/projects/fpga-arithmetic',{waitUntil:'networkidle'});await page.locator('#fpga-demo').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Load A',exact:true}).click();
  for(const bit of [7,6,5,4,3,2,1,0])await page.locator('.dip-switches label').filter({hasText:`SW${bit}`}).locator('input').setChecked(bit===1);
  await page.getByRole('button',{name:'Load B',exact:true}).click();await page.getByRole('button',{name:'Subtract',exact:true}).click();assert.match(await page.locator('.demo-message').textContent(),/19 \/ 0x13/);
  await page.screenshot({path:`${artifactDirectory}/fpga-model.png`});result.checks.push('Project keyboard focus; FIFO write/simultaneous/read/reset; FPGA independent capture/subtract/output');
  await page.goto(base+'/contact',{waitUntil:'networkidle'});let sends=0;
  await page.route('https://formspree.io/**',route=>{sends++;return route.fulfill({status:sends===1?200:500,contentType:'application/json',body:sends===1?'{}':'{"error":"mock"}'});});
  await page.getByRole('button',{name:'Send message'}).click();assert.equal(sends,0);
  for(const [name,value] of [['Name','QA local mock'],['Email','qa@example.com'],['Message','This is a local mocked test only.']])await page.getByLabel(name,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Send message'}).click();await page.waitForFunction(()=>document.querySelector('#form-status')?.dataset.state==='success');assert.equal(await page.getByLabel('Message',{exact:true}).inputValue(),'');
  for(const [name,value] of [['Name','QA local mock'],['Email','qa@example.com'],['Message','Retain this local mock after a delivery failure.']])await page.getByLabel(name,{exact:true}).fill(value);
  await page.getByRole('button',{name:'Send message'}).click();await page.waitForFunction(()=>document.querySelector('#form-status')?.dataset.state==='error');assert.ok((await page.getByLabel('Message',{exact:true}).inputValue()).includes('Retain'));await page.screenshot({path:`${artifactDirectory}/contact-error.png`});result.checks.push('Contact native validation, mocked success/reset and failure/retention; zero real submissions');
  await page.goto(base+'/resume',{waitUntil:'networkidle'});
  // Use the browser's network path so this check shares its proxy and TLS
  // configuration; Playwright's separate Node API client can bypass those.
  const pdf=await page.evaluate(async()=>{const r=await fetch('/resume/Omar_Alhalawani_ASIC_Resume.pdf');return {status:r.status,type:r.headers.get('content-type'),bytes:(await r.arrayBuffer()).byteLength};});
  assert.equal(pdf.status,200);assert.match(pdf.type,/application\/pdf/);assert.equal(pdf.bytes,90570);assert.ok(await page.getByRole('link',{name:'Download Resume'}).getAttribute('download')!==null);result.checks.push('ASIC PDF embed URL, browser GET response, and download attribute');
  for(let i=0;i<2;i++)for(const route of ['/','/projects','/projects/fifo','/projects','/experience','/about','/']){await page.goto(base+route,{waitUntil:'networkidle'});await ready(page);assert.ok(await page.locator('canvas').count()<=1||route==='/');}
  const unexpected=errors.filter(error=>!/^Failed to load resource: the server responded with a status of 500 \(.*\)$/.test(error));
  assert.deepEqual(unexpected,[]);result.checks.push('Two route stress cycles; no unexpected console/network errors or duplicate scene canvases. Mocked form failure intentionally returns 500.');await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(base+'/contact',{waitUntil:'networkidle'});await mobile.getByText('Menu',{exact:true}).click();assert.ok(await mobile.locator('.mobile-nav').getAttribute('open')!==null);await mobile.locator('.mobile-nav').getByRole('link',{name:'Projects'}).click();await mobile.waitForURL(base+'/projects');result.checks.push('Mobile menu and project navigation');await mobile.close();
  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await reduced.goto(base,{waitUntil:'networkidle'});await ready(reduced);assert.equal(await reduced.locator('.scene-island').first().getAttribute('data-render-loop'),'demand');await reduced.screenshot({path:`${artifactDirectory}/home-reduced.png`});await reduced.locator('[data-layer="3"]').focus();assert.equal(await reduced.locator('[data-layer="3"]').getAttribute('aria-pressed'),'true');result.checks.push('Reduced motion renders an intentional static composition and responds to focus');await reduced.close();
  const fallback=await browser.newPage({viewport:{width:390,height:844}});await fallback.addInitScript(()=>{window.Worker=undefined;const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
  for(const route of ['/','/projects','/projects/fifo']){await fallback.goto(base+route,{waitUntil:'networkidle'});await fallback.locator('.scene-island').first().scrollIntoViewIfNeeded();await fallback.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='fallback');assert.equal(await fallback.locator('canvas').count(),0);await verifyLayout(fallback);}
  await fallback.screenshot({path:`${artifactDirectory}/fifo-fallback.png`});result.checks.push('WebGL unavailable: scene-specific SVG, complete HTML, no blank canvas');await fallback.close();
  const lost=await browser.newPage({viewport:{width:1440,height:900}});await lost.goto(base+'/projects',{waitUntil:'networkidle'});await ready(lost);await lost.locator('canvas').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await lost.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='fallback');assert.equal(await lost.locator('canvas').count(),0);result.checks.push('Context loss safely disposes canvas and returns to static artwork');await lost.close();
}catch(error){result.errors.push(error.stack||error.message);process.exitCode=1;console.error(error);}
finally{fs.writeFileSync(`${artifactDirectory}/browser-results.json`,JSON.stringify(result,null,2));await browser.close();await local?.close();console.log(`QA complete: ${result.matrix.length} layouts, ${result.accessibility.length} axe audits, ${result.checks.length} behavior groups, ${result.errors.length} failures.`);}
