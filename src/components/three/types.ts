export type SceneKind = 'contact' | 'hero' | 'verification' | 'floorplan' | 'fifo' | 'fpga' | 'emg' | 'lumalink' | 'cubex' | 'daq';
export type GraphicsTier = 'high' | 'medium' | 'low';
export interface SceneProps { reducedMotion: boolean; tier: GraphicsTier; }
