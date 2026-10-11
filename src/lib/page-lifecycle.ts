// Bundled Astro scripts run once. Each page gets fresh, scoped handlers and
// observers; dispose before the old DOM and React islands are swapped out.
export function onPage(init:(signal:AbortSignal)=>void|(()=>void)){
 let controller:AbortController|undefined,dispose:void|(()=>void);
 const cleanup=()=>{controller?.abort();dispose?.();dispose=undefined;};
 const start=()=>{cleanup();controller=new AbortController();dispose=init(controller.signal);};
 document.addEventListener('astro:before-swap',cleanup);
 document.addEventListener('astro:page-load',start);
 start();
}
