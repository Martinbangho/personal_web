import type { APIRoute } from 'astro';
import { withBase } from '../utils/paths';

const disallowedPaths = [
  'chyba.html',
  'odeslano.html',
  'assets/img/kate/',
  'ochrana-osobnich-udaju.html',
];

const FALLBACK_SITE = 'https://www.bangho.cz';

export const GET: APIRoute = ({ site }) => {
  const rules = disallowedPaths
    .map((path) => `Disallow: ${withBase(path)}`)
    .join('\n');

  const sitemapPath = withBase('sitemap.xml');
  const sitemapUrl = site ? new URL(sitemapPath, site).toString() : new URL(sitemapPath, FALLBACK_SITE).toString();

  const lines = [
    'User-agent: *',
    rules,
    '',
    `Sitemap: ${sitemapUrl}`,
  ].join('\n');

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
