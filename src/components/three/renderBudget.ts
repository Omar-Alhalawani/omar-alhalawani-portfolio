import {useEffect,useState,type RefObject} from 'react';
let current:HTMLElement|undefined;
const entries=new Map<HTMLElement,{ratio:number;notify:(active:boolean)=>void}>();
function schedule(){let winner:HTMLElement|undefined,score=0;if(!document.hidden)for(const [host,entry] of entries){if(entry.ratio>score){winner=host;score=entry.ratio;}}const existing=current&&entries.get(current);if(!document.hidden&&existing&&existing.ratio>.05&&score<existing.ratio+.12)winner=current;current=winner;for(const [host,entry] of entries)entry.notify(host===winner);}
export function useRenderBudget(host:RefObject<HTMLDivElement|null>){
 const [active,setActive]=useState(false);
 useEffect(()=>{const element=host.current;if(!element)return;entries.set(element,{ratio:0,notify:setActive});const observer=new IntersectionObserver(([entry])=>{const item=entries.get(element);if(item)item.ratio=entry.isIntersecting?entry.intersectionRatio:0;schedule();},{threshold:[0,.01,.1,.25,.5,.75,1],rootMargin:'0px'});observer.observe(element);document.addEventListener('visibilitychange',schedule);return()=>{observer.disconnect();entries.delete(element);document.removeEventListener('visibilitychange',schedule);schedule();};},[host]);
 return active;
}
