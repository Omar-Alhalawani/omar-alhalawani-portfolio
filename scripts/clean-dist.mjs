import {rmSync} from 'node:fs';
// Astro's incremental output can leave obsolete hashed assets in a reused
// workspace. A production build starts with only the current source artifacts.
rmSync(new URL('../dist/',import.meta.url),{recursive:true,force:true});
