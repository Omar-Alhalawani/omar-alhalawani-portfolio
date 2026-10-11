import {onPage} from './page-lifecycle';
export const sectionNames=['home','experience','projects','about','contact'] as const;
export type SignalSection=typeof sectionNames[number];
const played=new Set<string>();
let initialized=false;
export function initializeSignals(){
 if(initialized)return;initialized=true;
 onPage(signal=>{
  const path=location.pathname,route:SignalSection=path.startsWith('/experience')?'experience':path.startsWith('/projects')?'projects':path.startsWith('/about')||path.startsWith('/resume')?'about':path.startsWith('/contact')?'contact':'home';
  const candidates: [string,SignalSection][]=[['[data-hero-surface]','home'],['.home-experience,.experience-flagship','experience'],['.home-projects,.project-explorer,.case-hero','projects'],['.home-about,.about-intro','about'],['.contact-hero,main > .cta-band','contact']];
  const sections:HTMLElement[]=[];
  for(const [selector,name] of candidates)document.querySelectorAll<HTMLElement>(selector).forEach(el=>{if(el.parentElement?.closest('main [data-signal-section]'))return;el.dataset.signalSection=name;sections.push(el);});
  let current:SignalSection|undefined;
  const activate=(name:SignalSection)=>{
   if(current===name)return;current=name;document.body.dataset.signalSection=name;
   const key=`${path}:${name}`;if(played.has(key))return;played.add(key);
   const stamp=String(performance.now());document.body.dataset.signalStart=stamp;
   document.querySelectorAll<HTMLElement>(`[data-signal-section="${name}"]`).forEach(el=>el.dataset.signalStart=stamp);
   window.dispatchEvent(new CustomEvent('portfolio:section-signal',{detail:name}));
  };
  activate(route);
  // A viewport band and an 8-point dominance margin provide hysteresis without scroll RAF.
  const visible=new Map<HTMLElement,number>();
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>visible.set(entry.target as HTMLElement,entry.isIntersecting?entry.intersectionRatio:0));

    const ranked=[...visible].filter(([,ratio])=>ratio>0).sort((a,b)=>b[1]-a[1]);
    const next=ranked[0]?.[0].dataset.signalSection as SignalSection|undefined;
    const existing=[...visible].find(([el])=>el.dataset.signalSection===current)?.[1]??0;
    if(next&&(existing===0||ranked[0][1]>existing+.08))activate(next);

  },{rootMargin:`-${Math.round(innerHeight*.18)}px 0px -${Math.round(innerHeight*.42)}px 0px`,threshold:[0,.05,.15,.3,.5,.75,1]});
  sections.forEach(el=>observer.observe(el));
  const hint=document.querySelector<HTMLElement>('[data-globe-hint]');let hintTimer:ReturnType<typeof setTimeout>|undefined;
  if(hint&&!sessionStorage.getItem('portfolio:globe-hint')){
   const hintObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){hint.hidden=false;sessionStorage.setItem('portfolio:globe-hint','seen');hintTimer=setTimeout(()=>hint.hidden=true,3500);hintObserver.disconnect();}},{threshold:.4});
   hintObserver.observe(hint.parentElement!);signal.addEventListener('abort',()=>hintObserver.disconnect(),{once:true});
   hint.parentElement?.addEventListener('pointerdown',()=>{hint.hidden=true;clearTimeout(hintTimer);},{signal});
  }
  return()=>{observer.disconnect();clearTimeout(hintTimer);};
 });
}
