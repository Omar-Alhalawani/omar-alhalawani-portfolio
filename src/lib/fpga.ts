export interface FpgaState { switches:number; a:number; b:number; subtract:boolean; }
export const initialFpga: FpgaState={switches:21,a:0,b:0,subtract:false};
export type FpgaControl='load-a'|'load-b'|'add'|'sub'|'clear';
export function operateFpga(state:FpgaState,control:FpgaControl):FpgaState {
  switch(control) {
    case 'load-a':return {...state,a:state.switches&0xff};
    case 'load-b':return {...state,b:state.switches&0xff};
    case 'add':return {...state,subtract:false};
    case 'sub':return {...state,subtract:true};
    case 'clear':return {...state,a:0,b:0,subtract:false};
  }
}
export function arithmetic(state:FpgaState) {
  const intermediate=(state.subtract?state.a-state.b:state.a+state.b)&0x1ff;
  return {intermediate,result:intermediate&0xff};
}
