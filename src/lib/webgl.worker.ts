// Probe driver availability away from the document's interaction thread.
// The context is released immediately; all visible rendering stays in R3F.
let available=false;
try {
  const canvas=new OffscreenCanvas(1,1);
  const context=canvas.getContext('webgl2');
  available=Boolean(context);
  context?.getExtension('WEBGL_lose_context')?.loseContext();
}catch { /* The HTML/SVG composition remains the fallback. */ }
self.postMessage(available);
