import type { SceneKind } from '../components/three/types';

export interface Project {
  id:string; title:string; shortTitle:string; category:string; description:string; tags:string[];
  source?:string; scene:SceneKind; status:string; architecture:string[];
  sections:{title:string; text:string; points?:string[]}[];
}
const github='https://github.com/Omar-Alhalawani/';
export const projects:Project[]=[
  {
    id:'fifo', title:'Synchronous FIFO', shortTitle:'FIFO', category:'RTL / VERIFICATION',
    description:'A single-clock SystemVerilog FIFO, designed around explicit flow control and checked against a queue-based reference model.',
    tags:['SystemVerilog','RTL','Self-checking testbench','Icarus Verilog'], source:github+'sync-fifo-rtl-verification', scene:'fifo',status:'Public RTL + testbench',
    architecture:['Write handshake','Memory array','Read register','Reference queue'],
    sections:[
      {title:'A buffer with explicit boundaries.',text:'The FIFO decouples a producer and consumer within one clock domain. A fixed memory array stores words. Independent read and write pointers track locations, while an occupancy count determines full and empty states. DATA_WIDTH and DEPTH configure storage; the published defaults are 8 bits and 16 entries.'},
      {title:'What happens at the clock edge.',text:'Writes are accepted when wr_valid && wr_ready. Reads are accepted when rd_valid && rd_ready. Both decisions use the occupancy before the edge. The active-low rst_n reset is synchronous.',points:['Write only: increment occupancy and advance the write pointer.','Read only: decrement occupancy, advance the read pointer, and update dout.','Both accepted: advance both pointers and keep occupancy unchanged.','Neither accepted: hold state.','At full, a simultaneous read request does not make the write ready on that same edge. At empty, a new write is not available to read on that same edge.']},
      {title:'Registered output, predictable checking.',text:'rd_valid indicates that entries are available. dout is a registered read result: an accepted read updates it after the edge. The published scoreboard compares that result at the following clock edge, avoiding a comparison before the nonblocking assignment settles. This is not a fall-through read interface.'},
      {title:'Verification follows the transfers.',text:'A SystemVerilog queue, exp_q, is the reference FIFO. Accepted writes push expected words into it. Accepted reads pop the oldest word and arm a pending comparison. Stimulus is driven on the falling edge; the DUT samples on the rising edge. VCD output supports waveform inspection.',points:['Sanity: write and read a small sequence in order.','Boundary flags: fill to full, then drain to empty.','Wrap-around: alternate reads and writes until pointers roll over.','The RTL supports simultaneous accepted operations. The public testbench does not explicitly exercise that scenario; the browser illustration below can demonstrate it.']},
      {title:'The current depth constraint.',text:'The pointers wrap through binary overflow using $clog2(DEPTH) bits. The current implementation therefore assumes a power-of-two depth of at least two. Non-power-of-two depths would need explicit wrap logic. That limitation is part of the case study, rather than an unsupported claim of arbitrary-depth behavior.'},
    ],
  },
  {
    id:'fpga-arithmetic', title:'FPGA Arithmetic System', shortTitle:'FPGA', category:'DIGITAL DESIGN / FPGA',
    description:'DIP-switch operands, synchronized pushbutton controls, an add/subtract datapath, and eight LEDs on a ZedBoard.',
    tags:['Verilog','ZedBoard','Datapath','Vivado'],source:github+'FPGA-Based-Arithmetic-Display-System',scene:'fpga',status:'Public RTL + constraints',
    architecture:['DIP switches','A / B registers','Add / subtract','LED[7:0]'],
    sections:[
      {title:'From a switch position to a stored operand.',text:'The top-level Verilog targets the ZedBoard Zynq XC7Z020. Eight individual DIP-switch inputs form the sw[7:0] bus. A button edge captures that bus into A_reg or B_reg, so changing the switches later does not change an operand that has already been loaded.'},
      {title:'Controls cross into the clock domain.',text:'Each of the five asynchronous pushbutton signals passes through two flip-flops. A stored previous state then produces a rising-edge pulse. Synchronization reduces metastability propagation; edge detection turns a held button into a capture event. The design does not implement full mechanical debouncing.',points:['BTNL: capture operand A.','BTNR: capture operand B.','BTNU: select addition.','BTND: select subtraction.','BTNC: clear A and B and restore addition mode.']},
      {title:'A small, inspectable datapath.',text:'The combinational ALU zero-extends the two 8-bit operands into a 9-bit intermediate. The low eight result bits drive LD7 through LD0. Carry or borrow is not shown on an additional display. The constraints assign the 100 MHz board clock and the switches, pushbuttons, and LEDs to board pins.'},
      {title:'Implementation over embellishment.',text:'This project demonstrates registers, asynchronous input handling, and combinational arithmetic. It does not use a seven-segment display or a controller FSM. The browser demo reproduces operand capture and arithmetic values; it is not a physical simulation of metastability or button bounce.'},
    ],
  },
  {
    id:'emg',title:'EMG Signal Acquisition & Processing',shortTitle:'EMG',category:'INSTRUMENTATION / SIGNALS',
    description:'Connecting a MyoWare sensor and microcontroller to a serial stream, then making the signal inspectable in Python.',
    tags:['MyoWare','Arduino','Serial','Python','Signal processing'],source:github+'EMG-Signal-Acquisition-and-Processing',scene:'emg',status:'Portfolio case study',
    architecture:['MyoWare sensor','Microcontroller','Serial stream','Python processing','Visualization'],
    sections:[
      {title:'The hardware and software form one measurement loop.',text:'The acquisition path starts with a MyoWare EMG sensor and a microcontroller. Samples are transported over a serial connection. Python handles processing and plotting, joining the embedded capture path to a view of the signal.'},
      {title:'Make a stream understandable.',text:'The work connects sensor interfacing, firmware, communication, and visualization. The public portfolio describes noise reduction and signal inspection as the processing focus. The animation here uses a synthetic raw signal and a cleaner illustrative trace; it is not a recording or a physiological measurement.'},
      {title:'Keep the published detail honest.',text:'Portfolio V1 supports the sensor-to-Python description. The linked public repository currently contains only a minimal README and no acquisition or filtering implementation. Sampling rate, filter order, quantified performance, and clinical interpretation are therefore not claimed.'},
    ],
  },
  {
    id:'lumalink',title:'LumaLink',shortTitle:'OPTICAL',category:'REAL-TIME / OPTICAL COMMUNICATION',
    description:'Screen flashes become Morse, a QNX camera receiver captures them, and a local pipeline turns the decoded message into an emergency summary.',
    tags:['QNX','Raspberry Pi 5','C','Python','Optical signaling'],source:github+'lumalink',scene:'lumalink',status:'Public receiver + transmitter',
    architecture:['Text transmitter','Optical flashes','Camera / QNX','Morse decode','Local processing'],
    sections:[
      {title:'Communication through a camera.',text:'The transmitter converts text to Morse-code flashes on a computer display. A Raspberry Pi 5 running QNX uses a Camera Module 3 Wide to capture the optical signal. The receiver and processing pipeline reconstruct the message.'},
      {title:'Timing is part of the system.',text:'Frame capture is a time-sensitive part of optical decoding. The public C receiver uses the QNX Camera API; the Python transmitter produces the screen flashes. The case study emphasizes the relation between scheduling, capture, and decoding without claiming measured throughput or reliability.'},
      {title:'Processing stays local.',text:'The published Python pipeline uses a locally hosted Qwen model to produce an operator-friendly emergency summary. An SOS detection can launch a local dashboard. This was collaborative work by Omar, Zayd, and Adam. The visual is a conceptual transmitter/receiver link, with no real emergency traffic.'},
    ],
  },
  {
    id:'cubex',title:'CubeX Trio Revival',shortTitle:'PRINTER',category:'HARDWARE / MOTION CONTROL',
    description:'An in-progress conversion of a discontinued CubeX Trio toward a repairable Marlin platform with modern controller electronics.',
    tags:['Marlin','SKR V1.4 Turbo','TMC2209','Motion control'],source:github+'CubeX-Trio-Revival',scene:'cubex',status:'Restoration in progress',
    architecture:['Original frame','SKR controller','Marlin firmware','Motion / hotend'],
    sections:[
      {title:'Keep the mechanics. Rebuild the control.',text:'The restoration preserves the original frame and useful motion hardware while replacing proprietary electronics with a BIGTREETECH SKR V1.4 Turbo, TMC2209 drivers, and Marlin firmware. The initial target is a single-extruder Bowden configuration.'},
      {title:'Bring-up is a sequence of verified steps.',text:'The public log documents controller installation, USB communication, TMC2209 UART communication, axis movement, X/Y homing, thermistor and heater testing, PID tuning, and extruder direction correction. Each working subsystem reduces uncertainty in the next integration step.'},
      {title:'The remaining work is physical.',text:'The permanent hotend carriage, full bed reach, E-steps calibration, Z homing/probe integration, final travel configuration, and first calibration print remain pending in the public log. The miniature toolpath is conceptual; it does not claim a completed printer or successful print.'},
    ],
  },
  {
    id:'mini-lysimeter',title:'Mini-Lysimeter Research GUI',shortTitle:'DAQ',category:'RESEARCH / DATA ACQUISITION',
    description:'A Python acquisition interface connecting NI-DAQ and Arduino hardware to a repeatable research capture workflow.',
    tags:['Python','NI-DAQ','Arduino','Research instrumentation'],scene:'daq',status:'Public portfolio summary',
    architecture:['Sensors','NI-DAQ / Arduino','Python interface','Data capture'],
    sections:[
      {title:'Tools around the experiment.',text:'The research-oriented GUI brings NI-DAQ and Arduino hardware into an accessible data acquisition workflow. The focus is structured collection and a usable interface for laboratory work.'},
      {title:'Repeatability is an interface concern.',text:'Capture tools need to connect physical inputs, software state, and experiment data consistently. This project sits alongside the instrumentation experience described on the Experience page.'},
      {title:'A bounded public summary.',text:'Portfolio V1 describes the project, but identifies its source as unavailable. This case study preserves that public description without adding sampling rates, instrument specifications, undocumented features, or an unavailable source link.'},
    ],
  },
];

export const featuredProjects=projects.filter(p=>['fifo','fpga-arithmetic','emg','lumalink'].includes(p.id));
