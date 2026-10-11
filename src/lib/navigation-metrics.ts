// Quiet production builds; enabled explicitly by development/profile sessions.
export function navigationMark(name:string){
 if(!import.meta.env.DEV&&!window.__PORTFOLIO_PROFILE__)return;
 performance.mark(`project:${name}`);
 const start:Record<string,string>={'camera-end':'camera-start','capture-end':'capture-start','route-swap':'camera-end','destination-first-frame':'route-swap','handoff-removed':'destination-first-frame'};
 if(start[name]&&performance.getEntriesByName(`project:${start[name]}`).length)performance.measure(`project:${start[name]}→${name}`,`project:${start[name]}`,`project:${name}`);
}
