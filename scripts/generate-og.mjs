import fs from 'node:fs';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';

const server=await startQAServer();
const browser=await launchQABrowser();
try{
  const assets=fs.readdirSync('dist/_astro');
  const font=assets.find(file=>file.startsWith('space-grotesk-latin-600-normal')&&file.endsWith('.woff2'));
  const mono=assets.find(file=>file.startsWith('jetbrains-mono-latin-400-normal')&&file.endsWith('.woff2'));
  if(!font||!mono)throw new Error('Build the portfolio first so the self-hosted fonts are available.');
  const art=fs.readFileSync('public/art/silicon-fallback.svg','utf8');
  const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:Heading;src:url('${server.url}/_astro/${font}')}@font-face{font-family:Mono;src:url('${server.url}/_astro/${mono}')}*{box-sizing:border-box}body{margin:0;background:#030610;color:#f2f5fa;font-family:Heading;width:1200px;height:630px;overflow:hidden}.art{position:absolute;left:620px;top:0;width:610px;height:610px;opacity:.9}.art svg{width:100%;height:100%}.copy{position:relative;z-index:2;padding:58px 65px}.brand{font:14px Mono;color:#91a1b8;letter-spacing:.06em}h1{font-size:80px;font-weight:600;line-height:1.04;letter-spacing:-5px;margin:85px 0 34px}.accent{color:#75e4f6}.label{font:14px/2 Mono;color:#75e4f6;letter-spacing:.025em}.footer{position:absolute;left:65px;right:65px;bottom:45px;border-top:1px solid #283449;padding-top:24px;display:flex;justify-content:space-between;font:11px Mono;color:#91a1b8}</style></head><body><div class="art">${art}</div><div class="copy"><div class="brand">OA <span class="accent">//</span> SYSTEMS</div><h1>OMAR<br>ALHALAWANI<span class="accent">.</span></h1><div class="label">ASIC VERIFICATION //<br>COMPUTER SYSTEMS ENGINEERING</div></div><div class="footer"><span>SILICON → SIGNAL → SYSTEM</span><span>OTTAWA, CANADA // CARLETON UNIVERSITY</span></div></body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'public/og.png'});
  console.log('Generated original 1200 × 630 social preview.');
}finally{await browser.close();await server.close();}
