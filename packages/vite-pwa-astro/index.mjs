import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_INCLUDE = /\.(?:html|css|js|mjs|json|ico|png|jpg|jpeg|svg|webp|avif|woff2?|ttf|txt|xml)$/i;
const DEFAULT_EXCLUDES = [
  /^sw\.js$/i,
  /^pwa-manifest.*\.json$/i,
];

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkDir(entryPath);
      files.push(...nested);
    } else {
      files.push(entryPath);
    }
  }
  return files;
}

function shouldInclude(relPath, includeRegex, excludeMatchers) {
  if (!includeRegex.test(relPath)) {
    return false;
  }

  return !excludeMatchers.some((matcher) => {
    if (typeof matcher === 'string') {
      return matcher === relPath;
    }

    if (matcher instanceof RegExp) {
      return matcher.test(relPath);
    }

    return false;
  });
}

async function createPrecacheManifest(outDir, includeRegex, excludeMatchers) {
  const files = await walkDir(outDir);
  const manifest = [];

  for (const filePath of files) {
    const relPath = path.relative(outDir, filePath).replace(/\\/g, '/');

    if (!shouldInclude(relPath, includeRegex, excludeMatchers)) {
      continue;
    }

    const data = await fs.readFile(filePath);
    const revision = createHash('sha256').update(data).digest('hex').slice(0, 16);
    manifest.push({
      url: `/${relPath}`,
      revision,
    });
  }

  manifest.sort((a, b) => a.url.localeCompare(b.url));
  return manifest;
}

export default function VitePWA(userOptions = {}) {
  const {
    buildHash = Date.now().toString(36),
    include = DEFAULT_INCLUDE,
    exclude = [],
    manifestFilename = `pwa-manifest-${buildHash}.json`,
    manifestPlaceholder = '__PRECACHE_MANIFEST__',
    cacheVersionPlaceholder = '__CACHE_VERSION__',
  } = userOptions;

  const includeRegex = include instanceof RegExp ? include : DEFAULT_INCLUDE;
  const excludeMatchers = Array.isArray(exclude) ? exclude : [exclude];

  return {
    name: '@vite-pwa/astro-manifest',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const manifest = await createPrecacheManifest(outDir, includeRegex, [
          ...DEFAULT_EXCLUDES,
          ...excludeMatchers,
        ]);
        const manifestJson = JSON.stringify(manifest);

        const swPath = path.join(outDir, 'sw.js');
        try {
          const swContent = await fs.readFile(swPath, 'utf-8');
          const withManifest = swContent.split(manifestPlaceholder).join(manifestJson);
          const withVersion = withManifest.split(cacheVersionPlaceholder).join(JSON.stringify(buildHash));
          await fs.writeFile(swPath, withVersion);
        } catch (error) {
          if (error && error.code !== 'ENOENT') {
            console.warn(`[pwa] Failed to update service worker: ${error.message}`);
          }
        }

        const manifestPath = path.join(outDir, manifestFilename);
        await fs.writeFile(manifestPath, manifestJson, 'utf-8');
      },
    },
  };
}
