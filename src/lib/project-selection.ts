export const projectIds=['fifo','fpga-arithmetic','lumalink','mini-lysimeter','emg','cubex'] as const;
export type ProjectId=typeof projectIds[number];
export type ProjectIntent='hover'|'focus'|'tap';
const interaction:{hover:string|null;focus:string|null;tap:string|null}={hover:null,focus:null,tap:null};
const timers=new Map<string,ReturnType<typeof setTimeout>>(),prefetched=new Set<string>();
const preparations=new Map<string,Promise<void>>();
let locked:string|null=null;
export const projectSelectionLock=()=>locked;
export function lockProjectSelection(id:string|null){locked=id;}
const scenes:Record<ProjectId,()=>Promise<unknown>>={fifo:()=>import('../components/three/projects/FifoScene'),'fpga-arithmetic':()=>import('../components/three/projects/FpgaScene'),lumalink:()=>import('../components/three/projects/LumaScene'),'mini-lysimeter':()=>import('../components/three/projects/DaqScene'),emg:()=>import('../components/three/projects/EmgScene'),cubex:()=>import('../components/three/projects/CubexScene')};
export function selectProject(id:string) {
 if(!projectIds.includes(id as ProjectId)||(locked&&locked!==id))return;
 document.querySelectorAll<HTMLElement>('[data-project-world]').forEach(world=>{world.dataset.selected=id;});
 window.dispatchEvent(new CustomEvent('portfolio:project',{detail:id}));
}
export function prefetchProject(id:string,delay=180){
 if(!projectIds.includes(id as ProjectId)||prefetched.has(id)||timers.has(id))return;
 timers.set(id,setTimeout(()=>{timers.delete(id);void prepareProject(id);},delay));
}
export function prepareProject(id:string):Promise<void>{
 if(!projectIds.includes(id as ProjectId))return Promise.resolve();
 cancelProjectPrefetch(id);
 const existing=preparations.get(id);if(existing)return existing;
 prefetched.add(id);
 const controller=new AbortController(),deadline=setTimeout(()=>controller.abort(),1400);
 const route=fetch(`/projects/${id}`,{signal:controller.signal,credentials:'same-origin',cache:'force-cache'}).then(async response=>{
  if(!response.ok)throw new Error('Project prefetch unavailable');
  const documentHTML=new DOMParser().parseFromString(await response.text(),'text/html');
  documentHTML.querySelectorAll<HTMLScriptElement|HTMLLinkElement>('script[type="module"][src],link[rel="modulepreload"][href]').forEach(asset=>{
   const href=new URL(asset.getAttribute('src')||asset.getAttribute('href')!,location.origin);
   if(href.origin!==location.origin||document.querySelector(`link[href="${href.pathname}"]`))return;
   const link=document.createElement('link');link.rel='modulepreload';link.href=href.pathname;document.head.append(link);
  });
 }).finally(()=>clearTimeout(deadline));
 const ready=Promise.allSettled([route,scenes[id as ProjectId](),import('../components/three/CanvasShell')]).then(()=>{});
 preparations.set(id,ready);return ready;
}
export function cancelProjectPrefetch(id:string){clearTimeout(timers.get(id));timers.delete(id);}
export function setProjectIntent(id:string|null,kind:ProjectIntent){
 if(locked)return;
 if(id!==null&&!projectIds.includes(id as ProjectId))return;
 const previous=interaction[kind];interaction[kind]=id;
 if(id){selectProject(id);prefetchProject(id,kind==='hover'?180:0);}else if(previous)cancelProjectPrefetch(previous);
 window.dispatchEvent(new CustomEvent('portfolio:project-intent',{detail:{...interaction}}));
}
export const activeProjectIntent=()=>interaction.hover||interaction.focus||interaction.tap;
export function resetProjectIntent(){interaction.hover=interaction.focus=interaction.tap=null;for(const id of timers.keys())cancelProjectPrefetch(id);window.dispatchEvent(new CustomEvent('portfolio:project-intent',{detail:{...interaction}}));}
