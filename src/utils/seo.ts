import type { Locale } from '../data/navigation';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export interface SeoInput {
  title: string;
  description: string;
  canonical: string;
  keywords?: string;
  publisher?: string;
  author?: string;
  copyright?: string;
  robots?: string;
  contentLanguage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogSiteName?: string;
  ogUrl?: string;
  ogLocale?: string;
  alternates?: AlternateLink[];
}

export interface SeoTags {
  title: string;
  meta: { name?: string; property?: string; content: string }[];
  links: { rel: string; href: string; hreflang?: string }[];
}

const metaDefaults: Record<Locale, {
  robots: string;
  contentLanguage: string;
  keywords: string;
  publisher: string;
  author: string;
  copyright: string;
  siteName: string;
  ogLocale: string;
}> = {
  cs: {
    robots: 'index, follow',
    contentLanguage: 'Czech',
    keywords: 'Nic ti neřeknu',
    publisher: 'SEO Specialista Martin Bangho',
    author: 'SEO Specialista Martin Bangho',
    copyright: 'Copyright 2024',
    siteName: 'bangho.cz',
    ogLocale: 'cs',
  },
  en: {
    robots: 'index, follow',
    contentLanguage: 'English',
    keywords: 'I wont say anything',
    publisher: 'SEO Specialist Bangho Martin',
    author: 'SEO Specialist Bangho Martin',
    copyright: 'Copyright 2024',
    siteName: 'bangho.cz',
    ogLocale: 'en',
  },
};

export const buildSeoTags = (lang: Locale, input: SeoInput): SeoTags => {
  const defaults = metaDefaults[lang] ?? metaDefaults.cs;

  const meta = [
    { name: 'robots', content: input.robots ?? defaults.robots },
    { name: 'content-language', content: input.contentLanguage ?? defaults.contentLanguage },
    { name: 'keywords', content: input.keywords ?? defaults.keywords },
    { name: 'publisher', content: input.publisher ?? defaults.publisher },
    { name: 'author', content: input.author ?? defaults.author },
    { name: 'copyright', content: input.copyright ?? defaults.copyright },
    { name: 'description', content: input.description },
    { property: 'og:title', content: input.ogTitle ?? input.title },
    { property: 'og:description', content: input.ogDescription ?? input.description },
    { property: 'og:locale', content: input.ogLocale ?? defaults.ogLocale },
    { property: 'og:site_name', content: input.ogSiteName ?? defaults.siteName },
    { property: 'og:url', content: input.ogUrl ?? input.canonical },
    { property: 'og:image', content: input.ogImage ?? '' },
  ].filter((entry) => Boolean(entry.content));

  const links = [
    { rel: 'canonical', href: input.canonical },
    ...(input.alternates ?? []).map((alternate) => ({
      rel: 'alternate',
      href: alternate.href,
      hreflang: alternate.hreflang,
    })),
  ];

  return {
    title: input.title,
    meta,
    links,
  };
};

export type { SeoInput };
