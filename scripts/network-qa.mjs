import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const local=process.env.QA_BASE_URL?null:await startQAServer();const base=process.env.QA_BASE_URL||local.url;
const browser=await launchQABrowser();const results=[];
try{
  for(const route of ['/','/about','/resume','/contact','/projects/fifo']){
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.goto(base+route,{waitUntil:'networkidle'});
    if(route==='/'||route==='/projects/fifo'){
      await page.locator('.scene-island').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready');await page.waitForTimeout(700);
    }
    const entries=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,type:r.initiatorType,transfer:r.transferSize,decoded:r.decodedBodySize,duration:r.duration})));
    const sceneFiles=entries.filter(r=>/Scene|CanvasShell|RoundedBox|Waveform|SignalTrace|Board\./.test(r.name)).map(r=>r.name);
    if(['/about','/resume','/contact'].includes(route))assert.equal(sceneFiles.length,0,`${route} does not load graphics`);
    if(route==='/')assert.ok(!sceneFiles.some(name=>/FifoScene|FpgaScene|EmgScene|LumaScene|ProjectFloorplan|CubexScene/.test(name)),'Initial hero excludes unrelated project scenes');
    const duplicateScripts=entries.filter(r=>r.name.endsWith('.js')).map(r=>r.name);assert.equal(duplicateScripts.length,new Set(duplicateScripts).size);
    const stats=await page.locator('canvas').evaluateAll(canvases=>canvases.map(canvas=>canvas.dataset));
    const row={route,requests:entries.length,transferBytes:entries.reduce((sum,r)=>sum+r.transfer,0),sceneFiles,stats,entries};results.push(row);console.log(JSON.stringify({...row,entries:undefined}));await page.close();
  }
}finally{fs.mkdirSync('qa-artifacts',{recursive:true});fs.writeFileSync('qa-artifacts/network-results.json',JSON.stringify(results,null,2));await browser.close();await local?.close();}
