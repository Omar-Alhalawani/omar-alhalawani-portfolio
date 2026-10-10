import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// This replacement portfolio remains staging; preserve all noindex controls.
// VERCEL_URL can require sign-in. Metadata needs the publicly reachable project
// domain, including the social image, while all staging noindex controls remain.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export default defineConfig({
  site: host ? `https://${host}` : 'https://omar-alhalawani-portfolio.vercel.app',
  output: 'static',
  trailingSlash: 'never',
  integrations: [react()],
  build: { inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
});
