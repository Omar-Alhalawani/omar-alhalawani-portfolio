import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// V2 is a separate staging identity. Never canonicalize it to the V1 routes.
const host = process.env.VERCEL_URL;
export default defineConfig({
  site: host ? `https://${host}` : 'https://omar-portfolio-v2.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [react()],
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
});
