import type { Locale } from './navigation';
import type { AlternateLink } from '../utils/seo';

const serviceSlugPairs = [
  { cs: 'seo-audit', en: 'seo-audit' },
  { cs: 'navrh-struktury-webu', en: 'website-structure' },
  { cs: 'seo-redesign-webu', en: 'seo-redesign' },
  { cs: 'analyza-klicovych-slov', en: 'keyword-analysis' },
  { cs: 'technicky-audit-webu', en: 'technical-seo-audit' },
  { cs: 'online-pr-a-linkbuilding', en: 'online-pr-linkbuilding' },
  { cs: 'analyza-konkurence', en: 'competitor-analysis' },
  { cs: 'kontinualni-seo', en: 'continuous-seo' },
  { cs: 'seo-skoleni', en: 'seo-workshops' },
  { cs: 'marketingova-strategie', en: 'marketing-strategy' },
  { cs: 'obsahova-strategie', en: 'content-strategy' },
  { cs: 'copywritting', en: 'copywriting' },
  { cs: 'podpora-pro-startupy', en: 'support-for-startups' },
  { cs: 'skoleni-marketingu', en: 'marketing-workshops' },
  { cs: 'geo-optimalizace-llms', en: 'llm-optimization-geo' },
  { cs: 'konzultace-ai', en: 'ai-consulting' },
  { cs: 'ai-agenti-a-automatizace', en: 'ai-agents-and-automation' },
  { cs: 'skoleni-ai', en: 'ai-workshop' },
] as const satisfies ReadonlyArray<{ cs: string; en: string }>;

type ServiceSlugPair = (typeof serviceSlugPairs)[number];

const serviceSlugMap: Record<Locale, Map<string, ServiceSlugPair>> = {
  cs: new Map(serviceSlugPairs.map((pair) => [pair.cs, pair])),
  en: new Map(serviceSlugPairs.map((pair) => [pair.en, pair])),
};

const buildHref = (locale: Locale, slug: string) =>
  locale === 'cs'
    ? `https://bangho.cz/sluzby/${slug}.html`
    : `https://bangho.cz/en/services/${slug}.html`;

export const getServiceAlternates = (slug: string, lang: Locale): AlternateLink[] => {
  const pair = serviceSlugMap[lang].get(slug);

  if (!pair) {
    return [];
  }

  const csHref = buildHref('cs', pair.cs);
  const enHref = buildHref('en', pair.en);

  return [
    { href: csHref, hreflang: 'cs' },
    { href: enHref, hreflang: 'en' },
    { href: enHref, hreflang: 'x-default' },
  ];
};

export type ServiceSlug = ServiceSlugPair[keyof ServiceSlugPair];
