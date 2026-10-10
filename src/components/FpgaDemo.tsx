import {useEffect,useState} from 'react';
import {initialFpga,operateFpga,arithmetic,type FpgaControl} from '../lib/fpga';
import {hex} from '../lib/fifo';
import '../styles/demos.css';

const controls:{action:FpgaControl;label:string}[]=[{action:'load-a',label:'Load A'},{action:'load-b',label:'Load B'},{action:'add',label:'Add'},{action:'sub',label:'Subtract'},{action:'clear',label:'Clear'}];
export default function FpgaDemo() {
  const [ready,setReady]=useState(false);
  useEffect(()=>{setReady(true);},[]);
  const [state,setState]=useState(initialFpga);
  const result=arithmetic(state);
  useEffect(()=>{window.dispatchEvent(new CustomEvent('portfolio:fpga',{detail:state}));},[state]);
  return <div className="demo" id="fpga-demo" data-ready={ready} data-state={JSON.stringify(state)}>
    <p className="eyebrow">Interactive datapath // ZedBoard concept</p><h3>Capture. Compute. Display.</h3>
    <p className="demo-intro">Set the DIP switches and capture A or B. Stored operands stay fixed when switches change.</p>
    <fieldset className="dip-switches" disabled={!ready}><legend>DIP switch input / {state.switches} / 0x{hex(state.switches)}</legend><div>{[7,6,5,4,3,2,1,0].map(bit=><label key={bit}><span>SW{bit}</span><input type="checkbox" checked={Boolean((state.switches>>bit)&1)} onChange={event=>setState(current=>({...current,switches:event.target.checked?current.switches|(1<<bit):current.switches&~(1<<bit)}))}/><span>{(state.switches>>bit)&1}</span></label>)}</div></fieldset>
    <div className="actions">{controls.map(control=><button key={control.action} disabled={!ready} className={`button ${control.action==='load-a'?'button--primary':''}`} type="button" onClick={()=>setState(current=>operateFpga(current,control.action))}>{control.label}</button>)}</div>
    <dl className="demo-status fpga-values"><div><dt>A register</dt><dd>{state.a} / 0x{hex(state.a)}</dd></div><div><dt>B register</dt><dd>{state.b} / 0x{hex(state.b)}</dd></div><div><dt>Operation</dt><dd>{state.subtract?'Subtract':'Add'}</dd></div><div><dt>9-bit intermediate</dt><dd>0x{hex(result.intermediate,3)}</dd></div></dl>
    <div className="led-bank" aria-label={`LED output: ${result.result}, hexadecimal ${hex(result.result)}`}>{[7,6,5,4,3,2,1,0].map(bit=><div key={bit}><span>LD{bit}</span><span className={`led ${((result.result>>bit)&1)?'on':''}`}>{(result.result>>bit)&1}</span></div>)}</div>
    <p className="demo-message" role="status" aria-live="polite">{ready?`LED[7:0] = ${result.result} / 0x${hex(result.result)}`:'Preparing controls…'}</p>
    <p className="demo-note">Values follow the public RTL datapath. This demo illustrates capture and arithmetic; physical synchronizer timing and button bounce are not simulated.</p>
  </div>;
}
