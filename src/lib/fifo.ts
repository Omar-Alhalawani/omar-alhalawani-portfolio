export interface FifoState {
  depth:number; memory:(number|null)[]; wrPtr:number; rdPtr:number; count:number;
  output:number; cycles:number;
}
export interface FifoInputs { wrValid:boolean; rdReady:boolean; data:number; reset?:boolean; }
export interface FifoTransfer { state:FifoState; writeAccepted:boolean; readAccepted:boolean; readValue:number|null; }

export function createFifo(depth=8):FifoState {
  if(depth<2||!Number.isInteger(depth)||(depth&(depth-1))!==0)throw new RangeError('Depth must be a power of two of at least two.');
  return {depth,memory:Array<number|null>(depth).fill(null),wrPtr:0,rdPtr:0,count:0,output:0,cycles:0};
}

/** Decisions use pre-edge occupancy, matching the public FIFO RTL. */
export function clockFifo(current:FifoState,input:FifoInputs):FifoTransfer {
  const state={...current,memory:[...current.memory],cycles:current.cycles+1};
  if(input.reset) {
    // Reset invalidates the queue; the RTL does not clear the physical memory.
    Object.assign(state,{wrPtr:0,rdPtr:0,count:0,output:0});
    return {state,writeAccepted:false,readAccepted:false,readValue:null};
  }
  const writeAccepted=input.wrValid&&current.count<current.depth;
  const readAccepted=input.rdReady&&current.count>0;
  const readValue=readAccepted?current.memory[current.rdPtr]:null;
  if(writeAccepted) {state.memory[current.wrPtr]=input.data&0xff;state.wrPtr=(current.wrPtr+1)%current.depth;}
  if(readAccepted) {state.output=readValue??0;state.rdPtr=(current.rdPtr+1)%current.depth;}
  state.count=current.count+Number(writeAccepted)-Number(readAccepted);
  return {state,writeAccepted,readAccepted,readValue};
}

export function slotOccupied(state:FifoState,index:number) {
  return (index-state.rdPtr+state.depth)%state.depth<state.count;
}
export const hex=(value:number,width=2)=>value.toString(16).toUpperCase().padStart(width,'0');
