import fs from 'node:fs';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const server=await startQAServer();const browser=await launchQABrowser();
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  await page.goto(server.url,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('.scene-island')?.dataset.state==='ready');await page.waitForTimeout(300);
  const {profile}=await cdp.send('Profiler.stop');const nodes=new Map(profile.nodes.map(node=>[node.id,node]));
  const milliseconds=new Map();profile.samples.forEach((id,index)=>milliseconds.set(id,(milliseconds.get(id)||0)+profile.timeDeltas[index]/1000));
  const top=[...milliseconds].sort((a,b)=>b[1]-a[1]).slice(0,20).map(([id,time])=>({milliseconds:Math.round(time),...nodes.get(id).callFrame}));
  fs.mkdirSync('qa-artifacts',{recursive:true});fs.writeFileSync('qa-artifacts/startup.cpuprofile',JSON.stringify(profile));fs.writeFileSync('qa-artifacts/startup-profile-summary.json',JSON.stringify(top,null,2));console.log(JSON.stringify(top,null,2));
}finally{await browser.close();await server.close();}
