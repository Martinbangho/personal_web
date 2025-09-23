export type Locale = 'cs' | 'en';

export interface ContactBox {
  label: string;
  value: string;
  href?: string;
  icon: string;
  className?: string;
  external?: boolean;
}

export interface MenuItem {
  label: string;
  href?: string;
  external?: boolean;
  items?: MenuItem[];
}

export interface LanguageLink {
  code: Locale;
  label: string;
  shortLabel: string;
  href: string;
  flag: URL;
  hreflang: string;
}

export interface NavigationData {
  logoHref: string;
  email: string;
  contactBoxes: ContactBox[];
  menu: MenuItem[];
  languages: LanguageLink[];
  languageButtonLabel: string;
}

const flagIcons = {
  cs: new URL('../../public/assets/img/flags/cz.svg', import.meta.url),
  en: new URL('../../public/assets/img/flags/gb.svg', import.meta.url),
} as const;

const navigation: Record<Locale, NavigationData> = {
  cs: {
    logoHref: '',
    email: 'martin@bangho.cz',
    contactBoxes: [
      {
        label: 'Kancelář',
        value: 'Plzeň, TechTower',
        href: 'https://maps.app.goo.gl/WQSv46E17hudhFTM8',
        icon: 'bi bi-geo-alt',
        className: 'd-md-inline-block',
        external: true,
      },
      {
        label: 'K dispozici',
        value: '8:30 - 17:30',
        icon: 'bi bi-clock',
        className: 'd-none d-md-inline-block',
      },
      {
        label: 'Telefon',
        value: '721 956 907',
        href: 'tel:+420721956907',
        icon: 'bi bi-telephone',
      },
    ],
    menu: [
      {
        label: 'SEO Služby',
        items: [
          { label: 'SEO Audit', href: 'sluzby/seo-audit' },
          { label: 'Návrh struktury webu', href: 'sluzby/navrh-struktury-webu' },
          { label: 'SEO a redesign webu', href: 'sluzby/seo-redesign-webu' },
          { label: 'Analýza klíčových slov', href: 'sluzby/analyza-klicovych-slov' },
          { label: 'Technická SEO analýza', href: 'sluzby/technicky-audit-webu' },
          { label: 'Online PR a linkbuilding', href: 'sluzby/online-pr-a-linkbuilding' },
          { label: 'Analýza konkurence', href: 'sluzby/analyza-konkurence' },
          { label: 'Kontinuální SEO', href: 'sluzby/kontinualni-seo' },
          { label: 'SEO školení', href: 'sluzby/seo-skoleni' },
        ],
      },
      {
        label: 'Marketing',
        items: [
          { label: 'Marketingová strategie', href: 'sluzby/marketingova-strategie' },
          { label: 'Obsahová strategie', href: 'sluzby/obsahova-strategie' },
          { label: 'Copywriting', href: 'sluzby/copywritting' },
          { label: 'Podpora pro startupy', href: 'sluzby/podpora-pro-startupy' },
          { label: 'Školení marketingu', href: 'sluzby/skoleni-marketingu' },
        ],
      },
      {
        label: 'AI pro firmy',
        items: [
          { label: 'Optimalizace pro LLMs', href: 'sluzby/geo-optimalizace-llms' },
          { label: 'Konzultace AI', href: 'sluzby/konzultace-ai' },
          { label: 'AI agenti a automatizace', href: 'sluzby/ai-agenti-a-automatizace' },
          { label: 'Školení AI', href: 'sluzby/skoleni-ai' },
        ],
      },
      { label: 'Reference', href: '#works-section' },
      { label: 'Blog', href: 'https://blog.bangho.cz/', external: true },
      { label: 'Kontakt', href: '#contact-section' },
    ],
    languages: [
      {
        code: 'cs',
        label: 'Čeština',
        shortLabel: 'CZ',
        href: '',
        flag: flagIcons.cs,
        hreflang: 'cs',
      },
      {
        code: 'en',
        label: 'English',
        shortLabel: 'EN',
        href: 'en/',
        flag: flagIcons.en,
        hreflang: 'en',
      },
    ],
    languageButtonLabel: 'CZ',
  },
  en: {
    logoHref: 'en/',
    email: 'martin@bangho.cz',
    contactBoxes: [
      {
        label: 'Office',
        value: 'Plzeň, TechTower',
        href: 'https://maps.app.goo.gl/WQSv46E17hudhFTM8',
        icon: 'bi bi-geo-alt',
        className: 'd-md-inline-block',
        external: true,
      },
      {
        label: 'Available',
        value: '8:30 - 17:30 CEST',
        icon: 'bi bi-clock',
        className: 'd-none d-md-inline-block',
      },
      {
        label: 'Phone number',
        value: '+420 721 956 907',
        href: 'tel:+420721956907',
        icon: 'bi bi-telephone',
      },
    ],
    menu: [
      {
        label: 'SEO Services',
        items: [
          { label: 'SEO Audit', href: 'en/services/seo-audit' },
          { label: 'Website Structure', href: 'en/services/website-structure' },
          { label: 'Website Redesign', href: 'en/services/seo-redesign' },
          { label: 'Keyword Analysis', href: 'en/services/keyword-analysis' },
          { label: 'Technical SEO Audit', href: 'en/services/technical-seo-audit' },
          { label: 'Online PR & Linkbuilding', href: 'en/services/online-pr-linkbuilding' },
          { label: 'Competitor Analysis', href: 'en/services/competitor-analysis' },
          { label: 'Continuous SEO', href: 'en/services/continuous-seo' },
          { label: 'SEO Workshops', href: 'en/services/seo-workshops' },
        ],
      },
      {
        label: 'Marketing',
        items: [
          { label: 'Marketing Strategy', href: 'en/services/marketing-strategy' },
          { label: 'Content Strategy', href: 'en/services/content-strategy' },
          { label: 'Copywriting', href: 'en/services/copywriting' },
          { label: 'Support for Startups', href: 'en/services/support-for-startups' },
          { label: 'Marketing Workshops', href: 'en/services/marketing-workshops' },
        ],
      },
      {
        label: 'AI for Businesses',
        items: [
          { label: 'LLM Optimization', href: 'en/services/llm-optimization-geo' },
          { label: 'AI Consulting', href: 'en/services/ai-consulting' },
          { label: 'AI Agents & Automation', href: 'en/services/ai-agents-and-automation' },
          { label: 'AI Workshop', href: 'en/services/ai-workshop' },
        ],
      },
      { label: 'Case Studies', href: 'en/#works-section' },
      { label: 'Blog', href: 'https://blog.bangho.cz/', external: true },
      { label: 'Contact', href: 'en/#contact-section' },
    ],
    languages: [
      {
        code: 'cs',
        label: 'Čeština',
        shortLabel: 'CZ',
        href: '',
        flag: flagIcons.cs,
        hreflang: 'cs',
      },
      {
        code: 'en',
        label: 'English',
        shortLabel: 'EN',
        href: 'en/',
        flag: flagIcons.en,
        hreflang: 'en',
      },
    ],
    languageButtonLabel: 'EN',
  },
};

export const getNavigation = (lang: Locale = 'cs') => navigation[lang];

export type Navigation = typeof navigation;
