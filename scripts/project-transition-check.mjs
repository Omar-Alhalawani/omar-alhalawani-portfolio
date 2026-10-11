// The former full-document/image-storage check is superseded by the focused
// ClientRouter matrix, which also verifies retained canvases and browser Back.
if(process.env.TRANSITION_CASE)process.env.NAV_PROJECT=process.env.TRANSITION_CASE;
await import('./client-navigation-check.mjs');
