import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../data/navigation';
import type { AlternateLink } from './seo';

export type ServiceEntry = CollectionEntry<'services'>;

const SITE_URL = 'https://bangho.cz';

const LOCALE_PATH: Record<Locale, string> = {
  cs: '/sluzby',
  en: '/en/services',
};

let serviceCache: ServiceEntry[] | null = null;

const getServices = async () => {
  if (!serviceCache) {
    serviceCache = await getCollection('services');
  }

  return serviceCache;
};

export const clearServicesCache = () => {
  serviceCache = null;
};

export const getServicePath = (locale: Locale, slug: string) => {
  const base = LOCALE_PATH[locale];
  return `${base}/${slug}`;
};

export const getServiceUrl = (locale: Locale, slug: string) =>
  `${SITE_URL}${getServicePath(locale, slug)}`;

export const getServiceEntry = async (
  locale: Locale,
  slug: string,
): Promise<ServiceEntry | undefined> => {
  const services = await getServices();
  return services.find(
    (service) =>
      service.data.locale === locale && service.data.entrySlug === slug,
  );
};

export const getServiceStaticPaths = async (locale: Locale) => {
  const services = await getServices();

  return services
    .filter((service) => service.data.locale === locale)
    .map((service) => ({ params: { slug: service.data.entrySlug } }));
};

const getServiceGroup = async (id: string) => {
  const services = await getServices();
  return services.filter((service) => service.data.id === id);
};

export const getServiceAlternates = async (
  entry: ServiceEntry,
): Promise<AlternateLink[]> => {
  const group = await getServiceGroup(entry.data.id);
  const alternates = group.map((item) => ({
    href: getServiceUrl(item.data.locale, item.data.entrySlug),
    hreflang: item.data.locale,
  }));

  const defaultEntry =
    group.find((item) => item.data.locale === 'en') ?? group[0] ?? null;

  return defaultEntry
    ? [
        ...alternates,
        {
          hreflang: 'x-default',
          href: getServiceUrl(
            defaultEntry.data.locale,
            defaultEntry.data.entrySlug,
          ),
        },
      ]
    : alternates;
};

const baseWebsiteJsonLd: Record<Locale, { name: string; description: string }> = {
  cs: {
    name: 'Martin Bangho | SEO konzultant z Plzně',
    description:
      'Jsem SEO Konzultant z Plzně, který sází na pravdu a upřímnost, ne iluze. Mým cílem je pomáhat podnikatelům dosáhnout svých snů, díky efektivnímu marketingu.',
  },
  en: {
    name: 'Martin Bangho | SEO consultant from Pilsen',
    description:
      'I am an SEO consultant from Pilsen who values transparency over illusions. My goal is to help entrepreneurs achieve their vision through effective marketing.',
  },
};

export const buildWebsiteJsonLd = (locale: Locale) => {
  const config = baseWebsiteJsonLd[locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    alternateName: 'JohniQ',
    image: `${SITE_URL}/assets/hero/me.png`,
    description: config.description,
    url: `${SITE_URL}/`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    inLanguage: locale,
  };
};

const professionalServiceBase = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  image: `${SITE_URL}/assets/hero/me.png`,
  name: 'Martin Bangho SEO Specialista s přesahem do AI',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Koterovská 152',
    addressLocality: 'Plzeň',
    addressRegion: 'Plzeňský kraj',
    postalCode: '32600',
    addressCountry: 'CZ',
  },
  review: {
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: 'jakub Kejval',
    },
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 49.72906289760385,
    longitude: 13.409428784300687,
  },
};

export const buildProfessionalServiceJsonLd = async (locale: Locale) => {
  const services = await getServices();
  const localeServices = services.filter(
    (service) => service.data.locale === locale,
  );

  return {
    ...professionalServiceBase,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'cs' ? 'Služby' : 'Services',
      itemListElement: localeServices.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.data.title,
          url: getServiceUrl(service.data.locale, service.data.entrySlug),
          description: service.data.seo.description,
        },
      })),
    },
  };
};

export const getServiceSitemapEntries = async () => {
  const services = await getServices();
  const byId = new Map<string, ServiceEntry[]>();

  for (const service of services) {
    const group = byId.get(service.data.id);
    if (group) {
      group.push(service);
    } else {
      byId.set(service.data.id, [service]);
    }
  }

  const entries = [] as {
    loc: string;
    alternates: AlternateLink[];
  }[];

  for (const group of byId.values()) {
    for (const entry of group) {
      const alternates = group.map((item) => ({
        hreflang: item.data.locale,
        href: getServiceUrl(item.data.locale, item.data.entrySlug),
      }));

      entries.push({
        loc: getServiceUrl(entry.data.locale, entry.data.entrySlug),
        alternates,
      });
    }
  }

  return entries;
};
