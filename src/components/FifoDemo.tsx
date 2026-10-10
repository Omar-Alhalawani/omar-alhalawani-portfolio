import {useEffect,useState} from 'react';
import {createFifo,clockFifo,slotOccupied,hex} from '../lib/fifo';
import '../styles/demos.css';

export default function FifoDemo() {
  const [state,setState]=useState(()=>createFifo(8));
  const [write,setWrite]=useState(true),[read,setRead]=useState(false),[data,setData]=useState(161);
  const [message,setMessage]=useState('FIFO empty. Choose requests, then clock one cycle.');
  useEffect(()=>{window.dispatchEvent(new CustomEvent('portfolio:fifo',{detail:state}));},[state]);
  const step=(reset=false)=>{
    const transfer=clockFifo(state,{wrValid:write,rdReady:read,data,reset});
    setState(transfer.state);
    setMessage(reset?'Synchronous reset applied at this edge. Queue empty; stored memory is unchanged.':`${transfer.writeAccepted?'Write accepted':'Write not accepted'}; ${transfer.readAccepted?`read accepted: 0x${hex(transfer.readValue??0)}`:'read not accepted'}. Occupancy ${transfer.state.count} of 8.`);
  };
  return <div className="demo" id="fifo-demo" data-state={JSON.stringify(state)}>
    <p className="eyebrow">Interactive model // 8 illustrative entries</p>
    <h3>Put the handshake on a clock edge.</h3>
    <p className="demo-intro">Set write and read requests independently. Full and empty decisions use the state before the edge.</p>
    <div className="demo-controls">
      <label className="checkbox-label"><input type="checkbox" checked={write} onChange={event=>setWrite(event.target.checked)}/> wr_valid</label>
      <label className="checkbox-label"><input type="checkbox" checked={read} onChange={event=>setRead(event.target.checked)}/> rd_ready</label>
      <label className="number-label">Write data (0–255)<input type="number" min="0" max="255" value={data} onChange={event=>setData(Math.max(0,Math.min(255,Math.trunc(Number(event.target.value)))))}/></label>
    </div>
    <div className="actions"><button className="button button--primary" type="button" onClick={()=>step()}>Clock one cycle →</button><button className="button" type="button" onClick={()=>step(true)}>Reset + clock</button></div>
    <div className="memory-cells" aria-label="FIFO memory slots">{state.memory.map((word,index)=><div key={index} className={`memory-cell ${slotOccupied(state,index)?'occupied':''}`}><span className="slot-index">{index}</span><strong>{word===null?'—':hex(word)}</strong><span className="pointer-label">{state.wrPtr===index?'WR ':''}{state.rdPtr===index?'RD':''}</span></div>)}</div>
    <dl className="demo-status"><div><dt>Occupancy</dt><dd>{state.count} / 8</dd></div><div><dt>wr_ready</dt><dd>{Number(state.count<8)}</dd></div><div><dt>rd_valid</dt><dd>{Number(state.count>0)}</dd></div><div><dt>Full / empty</dt><dd>{Number(state.count===8)} / {Number(state.count===0)}</dd></div><div><dt>Registered dout</dt><dd>0x{hex(state.output)}</dd></div><div><dt>Stepped cycles</dt><dd>{state.cycles}</dd></div></dl>
    <p className="demo-message" role="status" aria-live="polite">{message}</p>
    <p className="demo-note">A browser illustration of the published RTL behavior. The RTL default is 16 entries. Dim slots are outside the active queue; reset clears queue state, not memory contents.</p>
  </div>;
}
