import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const browser=await launchQABrowser(),server=await startQAServer(),out='docs/mobile-pass';fs.mkdirSync(out,{recursive:true});
const report=process.env.MOBILE_RESUME?JSON.parse(fs.readFileSync(`${out}/partial-checks.json`,'utf8')):{renderer:'Chromium software SwiftShader; touch emulation, not physical iOS/Android devices',widths:[],checks:[],errors:[]};
const capture=async(p,name,sel)=>{await (sel?p.locator(sel):p).screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:78});console.log('capture',name);};
const scroll=(p,sel)=>p.locator(sel).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
const ready=(p,k)=>p.waitForFunction(key=>document.querySelector(`[data-scene="${key}"]`)?.dataset.state==='ready',k,{timeout:60000});
try{
 if(!process.env.MOBILE_RESUME){
 for(const [width,height] of [[320,844],[360,844],[390,844],[430,932],[844,390]]){
  const p=await browser.newPage({viewport:{width,height},isMobile:true,hasTouch:true});
  for(const route of ['/','/projects','/experience','/contact','/projects/fifo']){
   await p.goto(server.url+route+'?graphics=static');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width} ${route}: overflow`);
   if(width===320&&route==='/projects')await capture(p,'07-narrow-320','.project-map');
   if(width===430&&route==='/')await capture(p,'08-wide-430','.hero-assembly');
   if(width===844&&route==='/contact')await capture(p,'09-landscape');
  }
  report.widths.push({width,height,overflow:false});await p.close();
 }
 }
 fs.writeFileSync(`${out}/partial-checks.json`,JSON.stringify(report,null,2));
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await p.addInitScript(()=>window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}});p.on('pageerror',e=>report.errors.push(e.message));
 const cdp=await p.context().newCDPSession(p),touch=async(points)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});for(const point of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 if(!process.env.MOBILE_SKIP_HERO){
 await p.goto(server.url);await ready(p,'hero');const hero=await p.locator('.world-stage').boundingBox();assert.ok(hero.y<844*.8);await capture(p,'01-hero');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:hero.y+100}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:220,y:hero.y+110}]});await p.waitForFunction(()=>Math.abs(window.__PORTFOLIO_PROFILE__.scenes.hero.pose[3])>.05);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await p.waitForFunction(()=>Math.abs(window.__PORTFOLIO_PROFILE__.scenes.hero.pose[3])<.03,null,{timeout:10000});
 await touch([{x:190,y:hero.y+150},{x:193,y:hero.y+70},{x:194,y:hero.y+30}]);await p.waitForTimeout(300);assert.ok(await p.evaluate(()=>scrollY)>20);report.checks.push('Hero peeks into first viewport; horizontal tilt responds/settles; native vertical scroll works');
 }else await p.goto(server.url+'?graphics=static');
 await p.locator('.mobile-nav summary').click();await p.waitForFunction(()=>document.querySelector('main').inert);assert.equal(await p.locator('.mobile-nav nav a').count(),6);await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('main').inert);
 await p.goto(server.url+'/projects');await scroll(p,'.project-map');await ready(p,'floorplan');await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.activity?.bus?.progress===1);await capture(p,'02-projects-idle','.project-map');
 const cb=await p.locator('[data-scene="floorplan"] canvas').boundingBox(),target=await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(t=>t.id==='cubex'));await p.touchscreen.tap(cb.x+target.x,cb.y+target.y);await p.waitForFunction(()=>document.querySelector('[data-project-world]').dataset.selected==='cubex');
 await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.activity.cubex?.cycle>=1,null,{timeout:20000});await capture(p,'03-project-sheet','.project-map');await p.touchscreen.tap(cb.x+target.x,cb.y+target.y);assert.equal(new URL(p.url()).pathname,'/projects');
 await p.locator('[data-select-project="fifo"]').tap();assert.equal(await p.locator('[data-select-project="fifo"]').getAttribute('aria-pressed'),'true');const sheet=await p.locator('.project-preview').boundingBox(),canvasBox=await p.locator('[data-scene="floorplan"] canvas').boundingBox(),targets=await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets);assert.ok(Math.max(...targets.map(t=>canvasBox.y+t.y))+20<sheet.y);
 await p.locator('.project-preview a[href="/projects/fifo"]').tap();await p.waitForURL('**/projects/fifo');await ready(p,'fifo');await p.waitForFunction(()=>!document.querySelector('.project-handoff'));report.checks.push('Model tap selects; CubeX loops; second model tap stays selected; selector/sheet sync; explicit Open Project camera handoff works; sheet does not overlap models');
 await capture(p,'06-case-study');await scroll(p,'.case-toc');await p.locator('.case-toc a[href="#architecture"]').tap();await p.waitForTimeout(700);assert.ok(await p.locator('#architecture').evaluate(e=>e.getBoundingClientRect().top)>=140);
 await scroll(p,'[data-waveform]');await p.locator('[data-inspect-toggle]').tap();await p.locator('[data-wave-event]').filter({hasText:/^FULL$/}).tap();await scroll(p,'[data-wave-canvas]');const w=await p.locator('[data-wave-canvas]').boundingBox(),before=await p.locator('[data-waveform]').getAttribute('data-wave-start');
 await touch([{x:w.x+240,y:w.y+100},{x:w.x+175,y:w.y+102}]);assert.notEqual(await p.locator('[data-waveform]').getAttribute('data-wave-start'),before);await p.touchscreen.tap(w.x+160,w.y+80);assert.match(await p.locator('[data-wave-time]').innerText(),/t=\d+/);report.checks.push('Sticky case rail and anchor offset; waveform touch pan and tap cursor');
 await p.goto(server.url+'/experience');await scroll(p,'.verification-visual');await ready(p,'verification');await capture(p,'04-experience','.experience-flagship');assert.equal(await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.verification.activity.verification.looping),true);
 await p.goto(server.url+'/contact');await scroll(p,'.contact-globe');await ready(p,'contact');const g=await p.locator('[data-scene="contact"] canvas').boundingBox(),r=await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.contact.rotation);
 await touch([{x:g.x+g.width/2,y:g.y+g.height/2},{x:g.x+g.width/2+70,y:g.y+g.height/2+5}]);assert.notDeepEqual(await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.contact.rotation),r);
 const sy=await p.evaluate(()=>scrollY);await touch([{x:g.x+g.width/2,y:g.y+g.height/2},{x:g.x+g.width/2+2,y:g.y+g.height/2-100}]);await p.waitForTimeout(300);assert.notEqual(await p.evaluate(()=>scrollY),sy);
 await scroll(p,'#contact-form');await p.locator('#contact-name').tap();assert.equal(await p.locator('#contact-name').evaluate(e=>e===document.activeElement),true);await p.evaluate(()=>{document.activeElement.blur();scrollTo({top:0,behavior:'instant'});});
 await p.screenshot({path:`${out}/05-contact.jpg`,type:'jpeg',quality:78,fullPage:true});report.checks.push('Globe drag and vertical scroll coexist; mobile form input remains usable');
 await p.emulateMedia({reducedMotion:'reduce'});await p.goto(server.url);await ready(p,'hero');assert.equal(await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.hero.pose[6]),0);await p.close();
 const save=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await save.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));await save.goto(server.url);await save.waitForFunction(()=>document.querySelector('[data-scene="hero"]').dataset.state==='fallback');assert.equal(await save.locator('canvas').count(),0);await save.close();report.checks.push('Reduced motion static; Save-Data immediately retains real static artwork without a canvas');assert.deepEqual(report.errors,[]);
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify(report,null,2)+'\n');console.log('ALL PASS');
}finally{await browser.close();await server.close();}
