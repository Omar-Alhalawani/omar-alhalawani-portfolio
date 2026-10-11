export interface SceneSample {firstFrameMs?:number;dpr?:number;drawCalls?:number;triangles?:number;textures?:number;geometries?:number;pose?:number[];targets?:{id:string;x:number;y:number}[];stage?:number;}
declare global {interface Window {__PORTFOLIO_PROFILE__?:{frames:number[];scenes:Record<string,SceneSample>;interactive?:number};}}
export const profileEnabled=()=>typeof window!=='undefined'&&Boolean(window.__PORTFOLIO_PROFILE__);
