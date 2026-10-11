import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const server=await startQAServer(),browser=await launchQABrowser(),out='docs/focused-layout';
fs.mkdirSync(out,{recursive:true});const results={};
try{
 for(const [name,options] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',{viewport:{width:390,height:844},isMobile:true,hasTouch:true}]]){
  const page=await browser.newPage(options);
  await page.addInitScript(()=>{window.__layoutToken='same-document';});
  await page.goto(`${server.url}/experience`);
  assert.equal(await page.locator('h1').innerText(),'ASIC Engineer I Co-op');
  assert.equal(await page.locator('.page-intro,.experience-opening').count(),0);
  assert.equal(await page.locator('.company-label').filter({hasText:'Ciena'}).count(),1);
  await page.waitForFunction(()=>document.querySelector('[data-scene="verification"]')?.dataset.state==='ready',null,{timeout:60000});
  const layout=await page.evaluate(()=>{
   const a=document.querySelector('.flagship-copy').getBoundingClientRect(),b=document.querySelector('.verification-visual').getBoundingClientRect();
   return {textX:a.x,textBottom:a.bottom,modelX:b.x,modelTop:b.top,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(layout.overflow,false);
  if(name==='mobile')assert.ok(layout.modelTop>=layout.textBottom);else assert.ok(layout.modelX>layout.textX);
  if(name==='desktop'){
   const canvas=page.locator('[data-scene="verification"] canvas');
   const hash=b=>createHash('sha256').update(b).digest('hex');
   const first=hash(await canvas.screenshot());await page.waitForTimeout(1500);const second=hash(await canvas.screenshot());
   assert.notEqual(first,second);results.animation='Verification canvas visibly changes over time';
  }
  await page.locator('.experience-flagship').screenshot({path:`${out}/experience-${name}.jpg`,type:'jpeg',quality:85});
  const nav=page.locator(name==='desktop'?'.desktop-nav a[href="/contact"]':'.mobile-nav a[href="/contact"]');
  if(name==='mobile')await page.locator('.mobile-nav summary').click();
  await nav.click();await page.waitForURL('**/contact');
  assert.equal(await page.evaluate(()=>window.__layoutToken),'same-document');
  await page.waitForFunction(()=>document.querySelector('[data-scene="contact"]')?.dataset.state==='ready',null,{timeout:60000});
  await page.locator('.contact-form-wrap').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.contact-form-wrap')?.dataset.revealState!=='pending');
  await page.waitForTimeout(650);
  const form=await page.locator('.contact-form-wrap').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,width:r.width,center:r.x+r.width/2,viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.ok(Math.abs(form.center-form.viewport/2)<1);assert.ok(form.width<=800);assert.equal(form.overflow,false);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
  await page.screenshot({path:`${out}/contact-${name}.jpg`,fullPage:true,type:'jpeg',quality:85});
  results[name]={experience:layout,contact:form,navigation:'Client navigation retained document'};
  console.log(name,'passed');await page.close();
 }
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();await server.close();}
