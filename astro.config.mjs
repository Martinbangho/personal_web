import { defineConfig } from 'astro/config';
import VitePWA from '@vite-pwa/astro';

const buildHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? Date.now().toString(36);

export default defineConfig({
  output: 'static',
  integrations: [
    VitePWA({
      buildHash,
    }),
  ],
});
