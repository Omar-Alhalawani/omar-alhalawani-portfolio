import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const local=process.env.QA_BASE_URL?null:await startQAServer();
const base=process.env.QA_BASE_URL||local.url;
const output=process.env.QA_OUTPUT||'qa-artifacts';
fs.mkdirSync(output,{recursive:true});
const browser=await launchQABrowser();
const result={date:new Date().toISOString(),base,pointer:false,nativeTabSwitch:false,physicalDeviceBenchmark:false,delayedControls:[],errors:[]};
try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});
  const hero=page.locator('.scene-island[data-scene="hero"]');
  await page.waitForFunction(()=>document.querySelector('.scene-island[data-scene="hero"]')?.dataset.state==='ready');
  for(const [x,y] of [[1,1],[1438,1],[1438,898],[1,898],[1000,450]]){
    await page.mouse.move(x,y);await page.waitForTimeout(180);
    assert.equal(await hero.getAttribute('data-state'),'ready');
  }
  assert.deepEqual(errors,[]);result.pointer=true;
  const second=await context.newPage();await second.goto(base+'/about',{waitUntil:'networkidle'});
  await second.bringToFront();await page.waitForTimeout(250);
  result.backgroundVisibility=await page.evaluate(()=>document.visibilityState);
  if(result.backgroundVisibility==='hidden'){
    assert.equal(await hero.getAttribute('data-render-loop'),'paused');
    await page.bringToFront();await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>document.visibilityState),'visible');
    assert.equal(await hero.getAttribute('data-render-loop'),'always');
    result.nativeTabSwitch=true;
  }else{
    result.tabSwitchLimitation='This headless runtime keeps pages visible; the existing emulated visibility check covers the application contract.';
    await page.bringToFront();
  }
  await second.close();await page.waitForTimeout(300);
  await page.screenshot({path:`${output}/home-pointer.jpg`,quality:90});
  assert.deepEqual(errors,[]);result.stats=await hero.locator('canvas').evaluate(canvas=>({...canvas.dataset}));
  // Hold each model's code in flight to reproduce the first-click race under
  // network latency. Controls must wait, then accept exactly the first action.
  for(const [path,id,chunk,button,key,expected] of [
    ['/projects/fifo','fifo-demo','FifoDemo','Clock one cycle','count',1],
    ['/projects/fpga-arithmetic','fpga-demo','FpgaDemo','Load A','a',21],
  ]){
    const modelPage=await context.newPage();let release;
    const gate=new Promise(resolve=>{release=resolve;});
    await modelPage.route(`**/${chunk}.*.js`,async route=>{await gate;await route.continue();});
    await modelPage.goto(base+path,{waitUntil:'networkidle'});
    const model=modelPage.locator(`#${id}`);await model.scrollIntoViewIfNeeded();
    assert.equal(await model.getAttribute('data-ready'),'false');
    assert.ok(await model.locator('input,button').evaluateAll(elements=>elements.every(el=>el.matches(':disabled'))));
    release();await modelPage.waitForFunction(id=>document.getElementById(id)?.dataset.ready==='true',id);
    await modelPage.getByRole('button',{name:button,exact:button==='Load A'}).click();
    await modelPage.waitForFunction(({id,key,expected})=>JSON.parse(document.getElementById(id).dataset.state)[key]===expected,{id,key,expected});
    result.delayedControls.push({route:path,disabledWhileLoading:true,firstActionAccepted:true});
    await modelPage.close();
  }
  console.log(JSON.stringify(result,null,2));
}catch(error){result.errors.push(error.stack||error.message);process.exitCode=1;console.error(error);}
finally{fs.writeFileSync(`${output}/interaction-results.json`,JSON.stringify(result,null,2));await browser.close();await local?.close();}
