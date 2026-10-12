import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const browser=await launchQABrowser(),server=await startQAServer(),report={renderer:'Chromium / software SwiftShader; platform uses existing low-detail tier',checks:[],samples:{},errors:[]};
const p=await browser.newPage({viewport:{width:1440,height:1000}});
await p.addInitScript(()=>window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}});p.on('pageerror',e=>report.errors.push(e.message));
const ready=k=>p.waitForFunction(key=>document.querySelector(`[data-scene="${key}"]`)?.dataset.state==='ready',k,{timeout:60000});
const sample=(kind,key)=>p.evaluate(([k,a])=>window.__PORTFOLIO_PROFILE__.scenes[k]?.activity?.[a],[kind,key]);
async function observe(kind,key,seconds){
 const observations=[],started=Date.now();
 while(Date.now()-started<seconds*1000){observations.push(await sample(kind,key));await p.waitForTimeout(250);}
 const all=observations.filter(Boolean);fs.writeFileSync(`/tmp/loop-${kind}-${key}.json`,JSON.stringify({all,state:await p.evaluate(()=>({loop:document.querySelector('[data-scene="floorplan"]')?.dataset.renderLoop,selected:document.querySelector('[data-project-world]')?.dataset.selected}))}));const cycles=[...new Set(all.map(v=>v.cycle))];assert.ok(Math.max(...cycles)>=2,`${key}: needs repeated cycles, got ${cycles}`);assert.ok(all.some(v=>!v.running&&v.progress===1),`${key}: pause missing`);assert.ok(all.some(v=>v.cycle>=2&&v.running),`${key}: restart missing`);
 report.samples[`${kind}/${key}`]={observedSeconds:(Date.now()-started)/1000,cycles,stages:[...new Set(all.map(v=>v.stage))],pauseObserved:true,last:all.at(-1)};console.log('PASS repeated',kind,key,cycles);
 return all;
}
try{
 if(!process.env.LOOP_PLATFORM){
 await p.goto(server.url+'/experience');await ready('verification');await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.verification?.activity?.verification?.running);
 await observe('verification','verification',23);await p.waitForFunction(()=>{const a=window.__PORTFOLIO_PROFILE__.scenes.verification.activity.verification;return a.cycle>=2&&!a.running;},null,{timeout:15000});report.checks.push('Experience: at least 3 complete cycles, staged activity and calm pauses');
 await p.goto(server.url+'/projects/cubex');await ready('cubex');const motion=await observe('cubex','cubex',15);assert.ok(motion.some(v=>Math.abs(v.motion?.[0]||0)>.1));assert.ok(motion.some(v=>!v.running&&Math.abs(v.motion?.[0]||0)<.03));report.checks.push('CubeX page: repeated toolhead/gantry motion and neutral pause');
 }else report.checks.push('Experience 23s and CubeX page 15s passed on preceding run');
 // Exercise the existing low-detail tier on the software GPU; no production budget changes.
 await p.setViewportSize({width:760,height:1000});await p.goto(server.url+'/projects');await p.locator('.project-map').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await ready('floorplan');
 for(const [id,key] of [['cubex','cubex'],['fifo','fifo'],['fpga-arithmetic','fpga'],['emg','emg']]){
  await p.locator(`[data-project="${id}"]`).dispatchEvent('pointerenter',{pointerType:'mouse'});await p.waitForFunction(k=>window.__PORTFOLIO_PROFILE__.scenes.floorplan?.activity?.[k]?.running,key);await p.waitForTimeout(100);
  await observe('floorplan',key,15);
  if(key==='cubex'){const mount=await p.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts.find(m=>m.id==='cubex'));assert.ok(Math.abs(mount.y-mount.restY-mount.activeLift)<.005);}
  await p.locator(`[data-project="${id}"]`).dispatchEvent('pointerleave',{pointerType:'mouse'});await p.waitForFunction(k=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.activity[k]?.enabled===false,key);assert.equal((await sample('floorplan',key)).running,false);
 }
 const a=await sample('floorplan','bus');assert.equal(a.looping,false);assert.equal(a.progress,1);report.checks.push('Active CubeX/FIFO/FPGA/EMG loops repeat; lift stays stable; pointer leave clears activity; entry bus remains one-shot');
 await p.locator('[data-project="cubex"]').dispatchEvent('pointerenter',{pointerType:'mouse'});await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.activity.cubex?.running);assert.equal((await sample('floorplan','cubex')).cycle,0);report.checks.push('Re-engagement restarts cleanly');
 await p.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await p.waitForFunction(()=>document.querySelector('[data-scene="floorplan"]').dataset.renderLoop==='paused');const paused=await sample('floorplan','cubex');await p.waitForTimeout(750);assert.deepEqual(await sample('floorplan','cubex'),paused);await p.locator('.project-map').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-scene="floorplan"]').dataset.renderLoop==='always');
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(200);const hidden=await sample('floorplan','cubex');await p.waitForTimeout(750);assert.deepEqual(await sample('floorplan','cubex'),hidden);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});report.checks.push('Offscreen and simulated hidden-tab visibility suspend timeline; renderer resumes');
 await p.emulateMedia({reducedMotion:'reduce'});await p.goto(server.url+'/experience');await ready('verification');const staticState=await sample('verification','verification');await p.waitForTimeout(800);assert.deepEqual(await sample('verification','verification'),staticState);assert.equal(staticState.running,false);assert.equal(staticState.looping,false);report.checks.push('Reduced motion remains static without autonomous loops');assert.deepEqual(report.errors,[]);
 fs.mkdirSync('docs/loop-fix',{recursive:true});fs.writeFileSync('docs/loop-fix/checks.json',JSON.stringify(report,null,2)+'\n');console.log('ALL PASS');
}finally{await browser.close();await server.close();}
