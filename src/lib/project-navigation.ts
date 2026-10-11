import {lockProjectSelection,prepareProject,projectIds,projectSelectionLock,resetProjectIntent,selectProject,type ProjectId} from './project-selection';

export const HANDOFF_KEY='portfolio:project-handoff';
export const LAST_PROJECT_KEY='portfolio:last-project';
export type NavigationPhase='idle'|'opening'|'holding'|'navigating';
export interface ProjectHandoff {id:ProjectId;image:string;timestamp:number;cameraScale:number;midFrame?:string;}
export interface ProjectOpening {id:ProjectId;duration:number;ready:Promise<void>;claim:()=>void;finish:(image?:string)=>void;}
declare global {interface Window {__PROJECT_HANDOFF__?:ProjectHandoff;}}
let phase:NavigationPhase='idle',deadline:ReturnType<typeof setTimeout>|undefined;
export const projectNavigationPhase=()=>phase;
export function projectNavigationHolding(){if(phase==='opening')phase='holding';}
export function lastSelectedProject():ProjectId|null{try{const id=sessionStorage.getItem(LAST_PROJECT_KEY);return projectIds.includes(id as ProjectId)?id as ProjectId:null;}catch{return null;}}

export function openProject(id:string){
 if(!projectIds.includes(id as ProjectId)||projectSelectionLock()||phase!=='idle')return;
 selectProject(id);lockProjectSelection(id);phase='opening';
 let claimed=false,finished=false;
 const finish=(image?:string)=>{
  if(finished)return;finished=true;clearTimeout(deadline);phase='navigating';
  let overlay:HTMLDivElement|undefined;
  try{
   sessionStorage.setItem(LAST_PROJECT_KEY,id);
   if(image){
    const midFrame=window.__PORTFOLIO_PROFILE__?.scenes.floorplan?.navigationMidFrame;
    sessionStorage.setItem(HANDOFF_KEY,JSON.stringify({id:id as ProjectId,image,timestamp:Date.now(),cameraScale:.72,...(midFrame?{midFrame}:{})} satisfies ProjectHandoff));
    overlay=document.createElement('div');overlay.className='project-handoff';overlay.setAttribute('aria-hidden','true');
    const frame=document.createElement('img');frame.src=image;frame.alt='';overlay.append(frame);
   }else sessionStorage.removeItem(HANDOFF_KEY);
  }catch{/* Navigation remains available when session storage is restricted. */}
  let navigated=false;
  const navigate=()=>{if(navigated)return;navigated=true;clearTimeout(deadline);location.assign(`/projects/${id}`);};
  const install=()=>{if(overlay)document.body.append(overlay);};
  if(overlay&&document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   try{
    const transition=document.startViewTransition(install);
    transition.ready.catch(navigate);transition.updateCallbackDone.catch(navigate);
    transition.finished.then(navigate,navigate);
    deadline=setTimeout(navigate,180);
   }catch{install();navigate();}
  }else{install();navigate();}
 };
 const request:ProjectOpening={id:id as ProjectId,duration:matchMedia('(pointer: coarse)').matches?360:520,ready:prepareProject(id),claim:()=>{claimed=true;},finish};
 window.dispatchEvent(new CustomEvent('portfolio:open-project',{detail:request}));
 if(!claimed||matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
 else deadline=setTimeout(()=>finish(),1400);
}

if(typeof window!=='undefined'){
 window.addEventListener('pagehide',()=>{clearTimeout(deadline);resetProjectIntent();});
 window.addEventListener('pageshow',event=>{
  if(!event.persisted)return;
  phase='idle';lockProjectSelection(null);resetProjectIntent();
  document.querySelectorAll('.project-handoff').forEach(element=>element.remove());
  window.dispatchEvent(new Event('portfolio:cancel-opening'));
 });
}
