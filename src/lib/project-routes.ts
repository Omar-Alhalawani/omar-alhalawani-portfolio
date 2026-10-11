import type {TransitionBeforePreparationEvent} from 'astro:transitions/client';
import {navigationMark} from './navigation-metrics';
const routes=new Map<string,{document:Document;ready:Promise<void>;timestamp:number}>();
const pending=new Map<string,Promise<void>>();
function warmAssets(doc:Document){
 const loading:Promise<void>[]=[];
 doc.querySelectorAll<HTMLLinkElement|HTMLScriptElement>('link[rel="stylesheet"][href],link[rel="modulepreload"][href],script[type="module"][src]').forEach(asset=>{
  const url=new URL(asset.getAttribute('href')||asset.getAttribute('src')!,location.origin);if(url.origin!==location.origin)return;
  const style=asset.getAttribute('rel')==='stylesheet';
  if([...document.head.querySelectorAll<HTMLLinkElement>('link[href]')].some(link=>link.href===url.href))return;
  const link=document.createElement('link');link.href=url.href;link.rel=style?'preload':'modulepreload';if(style)link.as='style';
  loading.push(new Promise(resolve=>{const done=()=>{clearTimeout(timer);resolve();};const timer=setTimeout(done,1500);link.addEventListener('load',done,{once:true});link.addEventListener('error',done,{once:true});}));document.head.append(link);
 });
 const hero=doc.querySelector<HTMLImageElement>('.case-canvas .scene-fallback');if(hero){const image=new Image();image.src=hero.src;}
 return Promise.all(loading).then(()=>{});
}
export const projectRoutePrepared=(id:string)=>{const route=routes.get(`/projects/${id}`);return Boolean(route&&Date.now()-route.timestamp<120000);};
export function prepareProjectRoute(id:string){
 const path=`/projects/${id}`,old=routes.get(path);if(old&&Date.now()-old.timestamp<120000)return old.ready;
 const existing=pending.get(path);if(existing)return existing;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1600);
 const ready=fetch(path,{signal:controller.signal,credentials:'same-origin'}).then(async response=>{
  if(!response.ok)throw Error('Route prefetch unavailable');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  if(!doc.querySelector('[name="astro-view-transitions-enabled"]'))throw Error('Route is not client navigable');
  doc.querySelectorAll('noscript').forEach(node=>node.remove());
  const assets=warmAssets(doc);routes.set(path,{document:doc,ready:assets,timestamp:Date.now()});await assets;navigationMark(`prefetch:${id}`);
 }).finally(()=>{clearTimeout(timer);pending.delete(path);});pending.set(path,ready);return ready;
}
// Astro owns history, swapping and View Transitions. Only its documented loader
// is supplied a prepared document; cold/failed routes use Astro's normal loader.
export function installProjectRouteCache(){
 document.addEventListener('astro:before-preparation',event=>{
  const preparation=event as TransitionBeforePreparationEvent;navigationMark('before-preparation');
  const cached=routes.get(preparation.to.pathname);
  if(!preparation.formData&&cached&&Date.now()-cached.timestamp<120000){
   preparation.loader=async()=>{await cached.ready;if(!preparation.signal.aborted)preparation.newDocument=cached.document.cloneNode(true) as Document;};
  }
 });
 document.addEventListener('astro:after-preparation',()=>navigationMark('after-preparation'));
}
