import type {SceneKind} from '../components/three/types';
// Text stays in the DOM, not baked into a reduced-resolution scene image.
export const scenePresentation:Record<SceneKind,{image:string;labels:string[]}>={
 hero:{image:'/art/silicon-fallback.svg',labels:['Compute package','Circuit board','I/O backplane']},
 verification:{image:'/art/verification-fallback.svg',labels:[]},
 floorplan:{image:'/art/floorplan-fallback.svg',labels:[]},
 fifo:{image:'/art/fifo-fallback.svg',labels:['Write control','Memory array','Read control']},
 fpga:{image:'/art/fpga-fallback.svg',labels:['8 DIP switches','A / B registers','ALU','8 LEDs']},
 emg:{image:'/art/emg-fallback.svg',labels:['Sensor','Acquisition','Serial','Processing']},
 lumalink:{image:'/art/lumalink-fallback.svg',labels:['Screen TX','Optical link','Camera RX','Decode']},
 cubex:{image:'/art/cubex-fallback.svg',labels:['Print head','Build platform','Motion control']},
 daq:{image:'/art/daq-fallback.svg',labels:['CH0–CH3','Acquisition','Data log']},
 contact:{image:'/art/contact-render.webp',labels:[]},
};
