import {navigate,type TransitionBeforeSwapEvent} from 'astro:transitions/client';
import {lockProjectSelection,prepareProject,projectIds,projectSelectionLock,resetProjectIntent,selectProject,type ProjectId} from './project-selection';
import {installProjectRouteCache} from './project-routes';
import {navigationMark} from './navigation-metrics';

export const HANDOFF_KEY='portfolio:project-handoff';
export const LAST_PROJECT_KEY='portfolio:last-project';
export type NavigationPhase='idle'|'opening'|'holding'|'navigating';
export type ProjectFrame=HTMLCanvasElement|string;
export interface ProjectEntry {cameraOffset:[number,number,number];sourceFit:number;sourceAspect:number;sourceFov:number;graphicsStage:number;enteredFromProjectWorld:true;}
export interface ProjectHandoff {id:ProjectId;frame?:HTMLCanvasElement;image?:string;timestamp:number;cameraScale:number;entry?:ProjectEntry;}
export interface ProjectOpening {id:ProjectId;duration:number;ready:Promise<void>;claim:()=>void;finish:(frame?:ProjectFrame,entry?:ProjectEntry)=>void;}
declare global {interface Window {__PROJECT_HANDOFF__?:ProjectHandoff;}}
let phase:NavigationPhase='idle',deadline:ReturnType<typeof setTimeout>|undefined,removal:ReturnType<typeof setTimeout>|undefined;
let overlay:HTMLDivElement|undefined,initialized=false;
export const projectNavigationPhase=()=>phase;
export function projectNavigationHolding(){if(phase==='opening')phase='holding';}
export function lastSelectedProject():ProjectId|null{try{const id=sessionStorage.getItem(LAST_PROJECT_KEY);return projectIds.includes(id as ProjectId)?id as ProjectId:null;}catch{return null;}}
function clearHandoff(){clearTimeout(removal);overlay?.remove();overlay=undefined;delete window.__PROJECT_HANDOFF__;}
function reset(){clearTimeout(deadline);phase='idle';lockProjectSelection(null);resetProjectIntent();}
function positionHandoff(){
 const hero=document.querySelector('.case-canvas')?.getBoundingClientRect(),picture=overlay?.firstElementChild as HTMLElement|undefined;
 if(!hero||!picture||!overlay)return;
 overlay.style.background='transparent';picture.style.cssText=`position:absolute;left:${hero.left}px;top:${hero.top}px;width:${hero.width}px;height:${hero.height}px;object-fit:contain;background:#07090b`;
}
function revealHandoff(){
 if(!overlay)return;
 positionHandoff();window.dispatchEvent(new Event('portfolio:handoff-reveal'));overlay.classList.add('project-handoff-revealing');
 clearTimeout(removal);removal=setTimeout(()=>{clearHandoff();navigationMark('handoff-removed');},150);
}
function installHandoff(handoff:ProjectHandoff){
 clearHandoff();window.__PROJECT_HANDOFF__=handoff;
 overlay=document.createElement('div');overlay.id='project-handoff';overlay.className='project-handoff';overlay.setAttribute('aria-hidden','true');
 let picture:HTMLElement;
 if(handoff.frame)picture=handoff.frame;else{const image=new Image();image.src=handoff.image!;image.alt='';picture=image;}
 picture.style.cssText='width:100%;height:100%;object-fit:contain';overlay.append(picture);
 // Astro swaps body/head; this retained canvas survives outside both, without
 // a second renderer, image encoding, storage serialization or nested VT.
 document.documentElement.append(overlay);
 // Renderer failures announce a ready static fallback. A generous final bound
 // prevents a stalled driver from keeping the retained frame forever.
 removal=setTimeout(revealHandoff,20000);
}
function hardNavigate(id:string){
 const handoff=window.__PROJECT_HANDOFF__;
 // Serialization is reserved for exceptional hard-navigation recovery.
 try{if(handoff?.frame){const image=handoff.frame.toDataURL('image/webp',.8);sessionStorage.setItem(HANDOFF_KEY,JSON.stringify({...handoff,frame:undefined,image}));}}catch{/* Normal navigation still works. */}
 location.assign(`/projects/${id}`);
}
export function openProject(id:string){
 if(!projectIds.includes(id as ProjectId)||projectSelectionLock()||phase!=='idle')return;
 navigationMark('click');selectProject(id);lockProjectSelection(id);phase='opening';
 let claimed=false,finished=false;
 const finish=(frame?:ProjectFrame,entry?:ProjectEntry)=>{
  if(finished)return;finished=true;clearTimeout(deadline);phase='navigating';navigationMark('camera-end');
  try{sessionStorage.setItem(LAST_PROJECT_KEY,id);}catch{/* Optional selection memory. */}
  if(frame)installHandoff({id:id as ProjectId,...(typeof frame==='string'?{image:frame}:{frame}),entry,timestamp:Date.now(),cameraScale:.72});
  navigationMark('navigate');
  deadline=setTimeout(()=>{if(phase==='navigating')hardNavigate(id);},8000);
  void navigate(`/projects/${id}`).catch(()=>hardNavigate(id));
 };
 const request:ProjectOpening={id:id as ProjectId,duration:matchMedia('(pointer: coarse)').matches?360:520,ready:prepareProject(id),claim:()=>{claimed=true;navigationMark('camera-start');},finish};
 window.dispatchEvent(new CustomEvent('portfolio:open-project',{detail:request}));
 if(!claimed||matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
 else deadline=setTimeout(()=>finish(),1100);
}
export function initializeProjectNavigation(){
 if(initialized)return;initialized=true;installProjectRouteCache();
 try{const raw=sessionStorage.getItem(HANDOFF_KEY);sessionStorage.removeItem(HANDOFF_KEY);if(raw){const h=JSON.parse(raw) as ProjectHandoff;if(location.pathname===`/projects/${h.id}`&&Date.now()-h.timestamp<15000&&/^data:image\/(webp|png);base64,/.test(h.image??''))installHandoff(h);}}catch{/* Optional recovery. */}
 // Native View Transitions can cancel when a touch viewport changes size.
 // The route still swaps and our retained canvas remains; consume that normal
 // cancellation rather than leaving an unhandled ready-promise rejection.
 document.addEventListener('astro:before-swap',event=>{void (event as TransitionBeforeSwapEvent).viewTransition.ready.catch(()=>{});});
 document.addEventListener('astro:after-preparation',()=>{if(phase==='navigating')clearTimeout(deadline);});
 document.addEventListener('astro:after-swap',()=>{
  navigationMark('route-swap');reset();
  if(window.__PROJECT_HANDOFF__&&location.pathname===`/projects/${window.__PROJECT_HANDOFF__.id}`)positionHandoff();else clearHandoff();
 });
 document.addEventListener('astro:page-load',()=>{navigationMark('html-ready');document.querySelector('details.mobile-nav')?.removeAttribute('open');});
 window.addEventListener('portfolio:destination-ready',revealHandoff);
 window.addEventListener('pagehide',()=>{clearTimeout(deadline);resetProjectIntent();});
 window.addEventListener('pageshow',event=>{if(event.persisted){reset();clearHandoff();window.dispatchEvent(new Event('portfolio:cancel-opening'));}});
}
