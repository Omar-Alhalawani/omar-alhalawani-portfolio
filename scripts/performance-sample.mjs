import fs from 'node:fs';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const label=process.argv[2]||'after',server=await startQAServer(),browser=await launchQABrowser();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>{
  window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};
  const p=window.__PORTFOLIO_PROFILE__;let last=0;
  new MutationObserver(()=>{const h=document.querySelector('.scene-island[data-scene="hero"]');if(h?.dataset.state==='ready'&&!p.interactive)p.interactive=performance.now();}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-state']});
  function tick(t){if(p.interactive){if(last&&p.frames.length<90)p.frames.push(t-last);last=t;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
 });
 await page.goto(server.url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.state==='ready',{},{timeout:90000});
 await page.waitForTimeout(6000);
 const result=await page.evaluate(()=>{
  const p=window.__PORTFOLIO_PROFILE__,c=document.querySelector('.scene-island[data-scene="hero"] canvas'),resources=performance.getEntriesByType('resource');
  const js=resources.filter(r=>r.name.match(/\.js(?:\?|$)/)),hero=js.filter(r=>/HeroScene|ChipLayers/.test(r.name));const times=p.frames.slice(5),mean=times.reduce((a,b)=>a+b,0)/times.length;
  return {environment:'Headless Chromium / SwiftShader software GPU; 1440×900; local gzip production server',staticHeroMs:resources.find(r=>r.name.includes('/art/hero-render.webp'))?.responseEnd,firstWebGLFrameMs:p.scenes.hero?.firstFrameMs||p.interactive,interactiveMs:p.interactive,initialJSBytes:js.reduce((a,r)=>a+r.encodedBodySize,0),heroChunkBytes:hero.reduce((a,r)=>a+r.encodedBodySize,0),activeRenderers:[...document.querySelectorAll('.scene-island[data-render-loop="always"]')].length,dpr:Number(c?.dataset.dpr)||p.scenes.hero?.dpr,averageFrameMs:mean,approxFPS:1000/mean,drawCalls:Number(c?.dataset.drawCalls)||p.scenes.hero?.drawCalls,triangles:Number(c?.dataset.triangles)||p.scenes.hero?.triangles,textures:Number(c?.dataset.textures)||p.scenes.hero?.textures,geometries:Number(c?.dataset.geometries)||p.scenes.hero?.geometries,jsHeapBytes:performance.memory?.usedJSHeapSize,samples:times.length};
 });
 fs.mkdirSync('qa-artifacts/performance-pass',{recursive:true});fs.writeFileSync(`qa-artifacts/performance-pass/${label}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();await server.close();}
