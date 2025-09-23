const ORIGIN = 'http://localhost';

const baseUrl = () => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return new URL(normalizedBase, ORIGIN);
};

const isExternalLike = (href: string) => /^(?:[a-zA-Z][a-zA-Z\d+\-.]*:|\/\/)/.test(href);

export const prependForwardSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const withBase = (path = '') => {
  const base = baseUrl();
  if (!path) {
    return base.pathname;
  }

  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalized || '.', base);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const resolveHref = (href: string | undefined, options: { external?: boolean } = {}) => {
  if (!href) {
    return undefined;
  }

  if (options.external || isExternalLike(href)) {
    return href;
  }

  return withBase(prependForwardSlash(href));
};

export const isExternalHref = (href: string | undefined) =>
  typeof href === 'string' && isExternalLike(href);
