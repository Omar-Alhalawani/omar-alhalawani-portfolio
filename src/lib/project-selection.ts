import {prepareProjectRoute,projectRoutePrepared} from './project-routes';
export const projectIds=['fifo','fpga-arithmetic','lumalink','mini-lysimeter','emg','cubex'] as const;
export type ProjectId=typeof projectIds[number];
export type ProjectIntent='hover'|'focus'|'tap';
const interaction:{hover:string|null;focus:string|null;tap:string|null}={hover:null,focus:null,tap:null};
const timers=new Map<string,ReturnType<typeof setTimeout>>();
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
 if(!projectIds.includes(id as ProjectId)||projectRoutePrepared(id)||timers.has(id))return;
 timers.set(id,setTimeout(()=>{timers.delete(id);void prepareProject(id);},delay));
}
export function prepareProject(id:string):Promise<void>{
 if(!projectIds.includes(id as ProjectId))return Promise.resolve();
 cancelProjectPrefetch(id);
 const existing=preparations.get(id);if(existing)return existing;
 const route=prepareProjectRoute(id);
 const ready=Promise.allSettled([route,scenes[id as ProjectId](),import('../components/three/CanvasShell')]).then(()=>{});
 preparations.set(id,ready);void ready.finally(()=>preparations.delete(id));return ready;
}
export function cancelProjectPrefetch(id:string){clearTimeout(timers.get(id));timers.delete(id);}
export function setProjectIntent(id:string|null,kind:ProjectIntent){
 if(locked)return;
 if(id!==null&&!projectIds.includes(id as ProjectId))return;
 const previous=interaction[kind];interaction[kind]=id;
 if(id){selectProject(id);prefetchProject(id,180);}else if(previous)cancelProjectPrefetch(previous);
 window.dispatchEvent(new CustomEvent('portfolio:project-intent',{detail:{...interaction}}));
}
export const activeProjectIntent=()=>interaction.hover||interaction.focus||interaction.tap;
export function resetProjectIntent(){interaction.hover=interaction.focus=interaction.tap=null;for(const id of timers.keys())cancelProjectPrefetch(id);window.dispatchEvent(new CustomEvent('portfolio:project-intent',{detail:{...interaction}}));}
