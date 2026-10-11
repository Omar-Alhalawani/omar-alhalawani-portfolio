let availability:Promise<boolean>|undefined;

export function webglAvailable():Promise<boolean> {
  if(availability)return availability;
  availability=new Promise(resolve=>{
    if(typeof Worker!=='undefined'&&typeof OffscreenCanvas!=='undefined'){
      try {
        const worker=new Worker(new URL('./webgl.worker.ts',import.meta.url),{type:'module'});
        const finish=(available:boolean)=>{clearTimeout(timeout);worker.terminate();resolve(available);};
        const timeout=setTimeout(()=>finish(false),2500);
        worker.onmessage=event=>finish(event.data===true);
        worker.onerror=()=>finish(false);
        return;
      }catch { /* Older browser policies may disallow worker construction. */ }
    }
    try {
      const context=document.createElement('canvas').getContext('webgl2');
      const available=Boolean(context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      resolve(available);
    }catch {resolve(false);}
  });
  return availability;
}
