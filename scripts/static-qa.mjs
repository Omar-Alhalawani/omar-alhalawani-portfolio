import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve('dist');
const files=fs.readdirSync(root,{recursive:true}).filter(file=>fs.statSync(path.join(root,file)).isFile());
const htmlFiles=files.filter(file=>file.endsWith('.html'));
const titles=new Set();
let internalLinks=0;
function locate(url){
  const pathname=decodeURIComponent(new URL(url,'https://qa.local').pathname);
  const requested=path.join(root,pathname);
  return [requested,path.join(requested,'index.html'),requested+'.html'].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
}
for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${file}: one page heading`);
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title&&!titles.has(title),`${file}: unique title`);titles.add(title);
  assert.match(html,/<meta name="description" content=".{30,}?"/);
  assert.match(html,/<meta name="robots" content="noindex, nofollow, noarchive"/);
  assert.match(html,/<meta property="og:image" content="https:\/\/[^"]+\/og.png"/);
  assert.ok(!html.includes('localhost')&&!html.includes('127.0.0.1')&&!html.includes('omar-alhalawani.github.io'));
  const structured=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
  assert.ok(JSON.parse(structured)['@graph'].some(item=>item['@type']==='Person'));
  for(const match of html.matchAll(/(?:href|src|component-url|renderer-url)="([^"]+)"/g)){
    const url=match[1];
    if(url.startsWith('/')){assert.ok(locate(url),`${file}: ${url} resolves`);internalLinks++;}
    if(url.startsWith('#'))assert.ok(html.includes(`id="${url.slice(1)}"`),`${file}: ${url} target exists`);
  }
  if(/^(about|resume|contact)\//.test(file))assert.ok(!html.includes('SceneIsland'),`${file}: content page excludes graphics island`);
}
assert.equal(htmlFiles.length,13);
assert.match(fs.readFileSync('public/robots.txt','utf8'),/Disallow: \/\s*$/);
assert.ok(JSON.parse(fs.readFileSync('vercel.json')).headers[0].headers.some(header=>header.key==='X-Robots-Tag'&&header.value.includes('noindex')));
const resume=fs.readFileSync('public/resume/Resume_Omar_Alhalawani.pdf');
const resumeSHA=crypto.createHash('sha256').update(resume).digest('hex');
assert.equal(resumeSHA,'0877264aa750bb38fc01f1f246fc07db39bf0f54d8f669db960291ceed460088');
const og=fs.readFileSync('public/og.png');
assert.equal(og.readUInt32BE(16),1200);assert.equal(og.readUInt32BE(20),630);
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<url>/g)||[]).length,12);
const chunks=files.filter(file=>file.endsWith('.js')).map(file=>{const bytes=fs.readFileSync(path.join(root,file));return {file,bytes:bytes.length,gzip:zlib.gzipSync(bytes).length};}).sort((a,b)=>b.gzip-a.gzip);
const result={builtAt:new Date().toISOString(),htmlPages:htmlFiles.length,internalLinksChecked:internalLinks,resumeBytes:resume.length,resumeSHA,og:[1200,630],sitemapRoutes:12,chunks};
fs.mkdirSync('qa-artifacts',{recursive:true});fs.writeFileSync('qa-artifacts/static-results.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,chunks:chunks.slice(0,8)},null,2));
