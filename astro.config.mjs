import { defineConfig } from 'astro/config';
import VitePWA from '@vite-pwa/astro';

const buildHash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? Date.now().toString(36);
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' && Boolean(repoName);
const site = process.env.SITE ?? 'https://bangho.cz';

export default defineConfig({
  site,
  base: isGitHubPages ? `/${repoName}` : '/',
  output: 'static',
  integrations: [
    VitePWA({
      buildHash,
    }),
  ],
});
