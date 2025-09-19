import type { APIRoute } from 'astro';
import { getServiceSitemapEntries } from '../utils/services';

const SITE_URL = 'https://bangho.cz';

interface AlternateLink {
  hreflang: string;
  href: string;
}

interface SitemapEntry {
  loc: string;
  priority?: string;
  alternates: AlternateLink[];
}

const staticEntries: SitemapEntry[] = [
  {
    loc: `${SITE_URL}/`,
    priority: '1.0',
    alternates: [
      { hreflang: 'cs', href: `${SITE_URL}/` },
      { hreflang: 'en', href: `${SITE_URL}/en/` },
    ],
  },
  {
    loc: `${SITE_URL}/en/`,
    priority: '1.0',
    alternates: [
      { hreflang: 'en', href: `${SITE_URL}/en/` },
      { hreflang: 'cs', href: `${SITE_URL}/` },
    ],
  },
];

const buildXml = (entries: SitemapEntry[]) => {
  const urlset = entries
    .map((entry) => {
      const alternateLinks = entry.alternates
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`,
        )
        .join('\n');

      const priority = entry.priority
        ? `    <priority>${entry.priority}</priority>\n`
        : '';

      return `  <url>\n    <loc>${entry.loc}</loc>\n${priority}${alternateLinks}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlset}\n</urlset>`;
};

export const GET: APIRoute = async () => {
  const services = await getServiceSitemapEntries();
  const serviceEntries: SitemapEntry[] = services.map((service) => ({
    loc: service.loc,
    priority: '0.8',
    alternates: service.alternates,
  }));

  const xml = buildXml([...staticEntries, ...serviceEntries]);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
