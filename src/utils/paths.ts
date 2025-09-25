const HAS_PROTOCOL = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

const normalizeBase = (base: string) => {
  if (!base) {
    return '/';
  }

  return base.endsWith('/') ? base : `${base}/`;
};

/**
 * Prefix a relative path with the configured Astro base URL.
 * External URLs (http:, https:, mailto:, tel:, etc.) are returned unchanged.
 */
export const resolvePath = (path?: string | null): string | undefined => {
  if (!path) {
    return path ?? undefined;
  }

  if (HAS_PROTOCOL.test(path) || path.startsWith('//')) {
    return path;
  }

  const base = normalizeBase(import.meta.env.BASE_URL ?? '/');

  if (path.startsWith('#')) {
    return `${base}${path}`;
  }

  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
};
