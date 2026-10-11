import fs from 'node:fs';
import assert from 'node:assert/strict';
import {launchQABrowser,startQAServer} from './qa-runtime.mjs';
const out='docs/premium-pass';fs.mkdirSync(out,{recursive:true});
const server=await startQAServer(),browser=await launchQABrowser();
const report=process.env.PREMIUM_RESUME?JSON.parse(fs.readFileSync(`${out}/partial-checks.json`,'utf8')):{renderer:'Chromium software SwiftShader; representative samples, no hardware FPS claim',checks:[],performance:{},errors:[]};
const ready=(p,kind)=>p.waitForFunction(k=>document.querySelector(`[data-scene="${k}"]`)?.dataset.state==='ready',kind,{timeout:60000});
const capture=async(p,name,sel)=>{await (sel?p.locator(sel):p).screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:80});console.log('capture',name);};
const scroll=(p,sel)=>p.locator(sel).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));
const nav=async(p,path)=>{await p.locator(`.desktop-nav a[href="${path}"]`).click();await p.waitForURL(u=>u.pathname.replace(/\/$/,'')===path);};
const setup=async options=>{const p=await browser.newPage(options);await p.addInitScript(()=>{window.__PORTFOLIO_PROFILE__={frames:[],scenes:{}};window.__premiumDocument='retained';});p.on('pageerror',e=>report.errors.push(e.message));return p;};
const sample=(p,kind)=>p.evaluate(k=>({activeRenderers:document.querySelectorAll('.scene-island[data-render-loop="always"]').length,...window.__PORTFOLIO_PROFILE__.scenes[k]}),kind);
try{
 const p=await setup({viewport:{width:1440,height:1000}});
 if(!process.env.PREMIUM_RESUME||process.env.PREMIUM_RESUME==='home'){
 await p.goto(server.url);
 if(!process.env.PREMIUM_RESUME){await ready(p,'hero');await capture(p,'01-home');report.performance.home=await sample(p,'hero');
 await p.mouse.move(1270,250);await p.waitForTimeout(500);await capture(p,'02-home-pointer');assert.ok((await sample(p,'hero')).pose[3]>.1);
 await p.mouse.move(20,900);await p.waitForTimeout(650);
 assert.equal(await p.locator('.signal-route').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await p.locator('.technical-background').getAttribute('data-pulse'),null);
 }
 await scroll(p,'.home-experience');await ready(p,'verification');await p.waitForFunction(()=>getComputedStyle(document.querySelector('.home-experience')).opacity==='1');await capture(p,'03-home-lower');
 await nav(p,'/experience');await ready(p,'verification');await capture(p,'04-experience');
 await nav(p,'/projects');await scroll(p,'.project-map');await ready(p,'floorplan');await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan?.activity?.bus?.progress>=1,null,{timeout:20000});await capture(p,'05-platform-idle','.project-map');report.performance.projectsIdle=await sample(p,'floorplan');
 await p.locator('[data-project="fifo"]').focus();await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan?.activity?.fifo?.stage>=1,null,{timeout:15000});await capture(p,'06-platform-hover','.project-map');report.performance.projectsSelected=await sample(p,'floorplan');
 await p.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan?.activity?.selection?.progress>=1,null,{timeout:20000});report.checks.push('Keyboard selection and local route activity settles');
 await scroll(p,'.project-map');await p.locator('.project-preview a[href="/projects/fifo"]').click();await p.waitForURL('**/projects/fifo');await ready(p,'fifo');await p.waitForFunction(()=>!document.querySelector('.project-handoff'));
 assert.equal(await p.evaluate(()=>window.__premiumDocument),'retained');await capture(p,'07-fifo');
 await scroll(p,'[data-waveform]');await p.locator('[data-inspect-toggle]').click();await p.locator('[data-probe="wr_ready"]').focus();assert.match(await p.locator('[data-probe-explanation]').innerText(),/count < DEPTH/);const renders=await p.locator('[data-waveform]').getAttribute('data-wave-renders');await p.waitForTimeout(400);assert.equal(await p.locator('[data-waveform]').getAttribute('data-wave-renders'),renders);report.checks.push('Retained document camera transition; FIFO keyboard probe and zero idle redraws');
 }
 for(const [id,kind,name] of [['lumalink','lumalink','08-lumalink'],['emg','emg','09-emg']]){await p.goto(`${server.url}/projects/${id}`);await ready(p,kind);await capture(p,name);}
 await nav(p,'/contact');await ready(p,'contact');await capture(p,'10-contact');report.performance.contact=await sample(p,'contact');
 const g=await p.locator('[data-scene="contact"] canvas').boundingBox(),before=(await sample(p,'contact')).rotation;
 await p.mouse.move(g.x+g.width*.5,g.y+g.height*.5);await p.mouse.down();await p.mouse.move(g.x+g.width*.5+90,g.y+g.height*.5+10,{steps:6});await p.mouse.up();await capture(p,'11-contact-drag');assert.notDeepEqual((await sample(p,'contact')).rotation,before);
 await scroll(p,'#contact-form');await p.locator('#contact-name').focus();await capture(p,'12-contact-form','#contact-form');
 const form=await p.locator('#contact-form').boundingBox();assert.ok(Math.abs(form.x+form.width/2-720)<2);
 await nav(p,'/about');await p.locator('.about-intro img').evaluate(e=>e.decode());await capture(p,'13-about');report.checks.push('Contact drag/inertia retained; centered form and focus state; About calm');await p.close();
 const mobile=await setup({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 for(const [path,kind,name] of [['/','hero','14-mobile-home'],['/projects','floorplan','15-mobile-projects'],['/contact','contact','16-mobile-contact']]){
  await mobile.goto(server.url+path);if(path==='/projects')await scroll(mobile,'.project-map');if(path==='/contact')await scroll(mobile,'.contact-globe');await ready(mobile,kind);if(path==='/projects')await mobile.waitForFunction(()=>window.__PORTFOLIO_PROFILE__.scenes.floorplan?.activity?.bus?.progress>=1,null,{timeout:20000});if(path==='/contact'){await scroll(mobile,'#contact-form');await mobile.waitForTimeout(650);await mobile.evaluate(()=>{document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});await mobile.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:80,fullPage:true});}else await capture(mobile,name,path==='/'?'.hero-assembly':'.project-map');
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await mobile.locator('.contact-entry').click();await mobile.waitForTimeout(500);assert.equal(await mobile.locator('#contact-name').evaluate(e=>e===document.activeElement),true);await mobile.close();
 const reduced=await setup({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await reduced.goto(server.url);await ready(reduced,'hero');await capture(reduced,'17-reduced-home');const a=(await sample(reduced,'hero')).pose;await reduced.waitForTimeout(300);const b=(await sample(reduced,'hero')).pose;assert.equal(a[6],b[6]);assert.equal(await reduced.locator('[data-reveal-state="pending"]').count(),0);await reduced.close();
 report.checks.push('Mobile no overflow, Contact jump/focus, reduced-motion static hero and readable content');assert.deepEqual(report.errors,[]);report.checks.push('No page errors; background SVG/CSS only, no added canvas/RAF');
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify(report,null,2)+'\n');console.log('ALL PASS');
}catch(e){fs.writeFileSync(`${out}/partial-checks.json`,JSON.stringify(report,null,2)+'\n');throw e;}finally{await browser.close();await server.close();}
