import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const output='docs/footprint-review';fs.mkdirSync(output,{recursive:true});
const server=await startQAServer(),browser=await launchQABrowser(),page=await browser.newPage({viewport:{width:1440,height:900}});
await page.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,/webgl/.test(type)?{...options,preserveDrawingBuffer:true}:options);};});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(server.url+'/projects',{waitUntil:'networkidle'});
 const host=page.locator('.scene-island[data-scene="floorplan"]');await host.scrollIntoViewIfNeeded();await page.mouse.move(1,1);
 await page.waitForFunction(()=>document.querySelector('.scene-island[data-scene="floorplan"]')?.dataset.state==='ready'&&Object.keys(window.__PORTFOLIO_PROFILE__.scenes.floorplan.footprints??{}).length===6,{},{timeout:60000});
 const footprints=await page.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.footprints);console.log(JSON.stringify(footprints,null,2));
 for(const [id,m] of Object.entries(footprints))assert.ok(m.fits,`${id}: complete model must retain 8% dock margin on every X/Z edge`);
 const idle=await page.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts);
 for(let i=0;i<idle.length;i++)for(let j=i+1;j<idle.length;j++){const a=idle[i],b=idle[j],da=footprints[a.id],db=footprints[b.id];assert.ok(Math.abs(a.x-b.x)>=(da.dockWidth+db.dockWidth)/2+.08||Math.abs(a.z-b.z)>=(da.dockDepth+db.dockDepth)/2+.08,`${a.id}/${b.id}: dock frames must remain separate`);}
 async function capture(name){await host.screenshot({path:`${output}/${name}.jpg`,type:'jpeg',quality:90});}
 await page.waitForTimeout(500);await capture('idle');
 const data=await host.locator('canvas').evaluate(c=>c.toDataURL('image/png'));
 await sharp(Buffer.from(data.split(',')[1],'base64')).resize({width:1400,withoutEnlargement:true}).flatten({background:'#07090b'}).webp({quality:89}).toFile('public/art/floorplan-render.webp');
 await sharp(await host.screenshot()).resize(640,480,{fit:'contain',background:'#080c0e'}).webp({quality:87}).toFile('public/images/project-overview.webp');
 for(const id of ['fifo','cubex']){
  const bounds=await host.locator('canvas').boundingBox(),point=await page.evaluate(id=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.targets.find(p=>p.id===id),id);
  await page.mouse.move(bounds.x+point.x,bounds.y+point.y);
  await page.waitForFunction(id=>{const m=window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts.find(m=>m.id===id);return Math.abs(m.y-m.restY-.22)<.001;},id,{timeout:12000});
  const hovered=await page.evaluate(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts);for(const m of hovered){const before=idle.find(b=>b.id===m.id);assert.equal(m.x,before.x);assert.equal(m.z,before.z);}
  await capture(id+'-hover');await page.mouse.move(1,1);await page.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan.mounts.every(m=>m.y===m.restY),{},{timeout:12000});
 }
 await page.evaluate(()=>window.dispatchEvent(new Event('portfolio:footprint-overview')));await page.waitForTimeout(350);await capture('top-overview');assert.deepEqual(errors,[]);
 fs.writeFileSync(`${output}/bounds.json`,JSON.stringify({footprints,mounts:idle,checks:['Six complete physical bounds fit with at least 8% per-edge clearance','All six dock frames remain separate','FIFO and CubeX hover +0.22, preserve X/Z, and return exactly to rest','Only four platform views captured']},null,2)+'\n');
 console.log('Platform footprint checks passed.');
}finally{await browser.close();await server.close();}
