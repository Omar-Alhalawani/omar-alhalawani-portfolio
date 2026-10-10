import fs from 'node:fs';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import desktop from 'lighthouse/core/config/desktop-config.js';
import {getQARuntime,qaChromeFlags,startQAServer} from './qa-runtime.mjs';

const local=process.env.QA_BASE_URL?null:await startQAServer();
const url=process.env.QA_BASE_URL||local.url;
const runtime=getQARuntime();
const chrome=await launch({chromePath:runtime.executablePath,chromeFlags:['--headless',...qaChromeFlags],envVars:runtime.env,logLevel:'error'});
const output=process.env.QA_OUTPUT||'qa-artifacts';
const results=[];fs.mkdirSync(output,{recursive:true});
try{
  for(const [name,config] of [['desktop',desktop],['mobile',undefined]]){
    const run=await lighthouse(url,{port:chrome.port,output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'},config);
    fs.writeFileSync(`${output}/lighthouse-${name}.json`,run.report[0]);fs.writeFileSync(`${output}/lighthouse-${name}.html`,run.report[1]);
    const scores=Object.fromEntries(Object.entries(run.lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)]));
    const metrics=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift'].map(key=>[key,{value:run.lhr.audits[key]?.numericValue,display:run.lhr.audits[key]?.displayValue}]));
    const failed=Object.entries(run.lhr.audits).filter(([,audit])=>audit.score!==null&&audit.score<1&&audit.scoreDisplayMode!=='informative').map(([key,audit])=>({key,score:audit.score,title:audit.title,description:audit.description,display:audit.displayValue}));
    const row={name,url,date:run.lhr.fetchTime,environment:`${local?'Local production output':'Live Vercel staging'}, Chromium 153, software WebGL. Lighthouse emulation is not a physical-device measurement.`,scores,metrics,failed};results.push(row);console.log(JSON.stringify(row,null,2));
  }
}finally{fs.writeFileSync(`${output}/lighthouse-summary.json`,JSON.stringify(results,null,2));chrome.kill();await local?.close();}
