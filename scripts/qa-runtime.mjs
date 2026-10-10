import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

export function getQARuntime() {
  let executablePath=process.env.CHROME_PATH;
  let browserDirectory;
  if(!executablePath && fs.existsSync(chromium.executablePath())) executablePath=chromium.executablePath();
  if(!executablePath) {
    // The official npm package includes Chromium; extraction avoids tar ownership
    // operations that are unsupported by some managed QA filesystems.
    browserDirectory=path.join(os.tmpdir(),'oa-portfolio-qa-chromium');
    executablePath=path.join(browserDirectory,'chromium');
    if(!fs.existsSync(executablePath) || fs.statSync(executablePath).size<1000000) {
      const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))),'..');
      fs.mkdirSync(browserDirectory,{recursive:true});
      for(const name of ['chromium.br','swiftshader.tar.br','fonts.tar.br','al2023.tar.br']) {
        const input=path.join(packageRoot,'bin',name);
        if(!fs.existsSync(input)) continue;
        const output=path.join(browserDirectory,name.replace(/\.br$/,''));
        fs.writeFileSync(output,zlib.brotliDecompressSync(fs.readFileSync(input)));
        if(output.endsWith('.tar'))execFileSync('tar',['--no-same-owner','-xf',output,'-C',browserDirectory]);
      }
      fs.chmodSync(executablePath,0o755);
    }
  }
  return {
    executablePath,
    env:{...process.env,...(browserDirectory?{LD_LIBRARY_PATH:`${browserDirectory}:${browserDirectory}/al2023/lib`,FONTCONFIG_PATH:`${browserDirectory}/fonts`}:{})},
  };
}

export const qaChromeFlags=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--in-process-gpu','--no-zygote',...(process.env.QA_PROXY_SERVER?[`--proxy-server=${process.env.QA_PROXY_SERVER}`]:[])];
export async function launchQABrowser(){return chromium.launch({...getQARuntime(),headless:true,args:qaChromeFlags});}

export async function startQAServer(directory='dist') {
  const root=path.resolve(directory);
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.pdf':'application/pdf','.xml':'application/xml','.woff2':'font/woff2','.txt':'text/plain'};
  const server=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://qa.local').pathname);
    const requested=path.resolve(root,`.${pathname}`);
    if(!requested.startsWith(root+path.sep) && requested!==root){response.writeHead(400);response.end();return;}
    let file=[requested,path.join(requested,'index.html'),requested+'.html'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
    const status=file?200:404;
    file??=path.join(root,'404.html');
    if(!fs.existsSync(file)){response.writeHead(404);response.end('Not found');return;}
    const bytes=fs.readFileSync(file);
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Robots-Tag':'noindex, nofollow, noarchive'};
    if((request.headers['accept-encoding']||'').includes('gzip') && /\.(html|js|css|svg|xml|json)$/.test(file)) {
      headers['Content-Encoding']='gzip';response.writeHead(status,headers);response.end(zlib.gzipSync(bytes));
    } else {response.writeHead(status,headers);response.end(bytes);}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return { url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(resolve=>server.close(resolve)) };
}
