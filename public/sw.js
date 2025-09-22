/* eslint-env serviceworker */
const CACHE_VERSION =
  typeof __CACHE_VERSION__ !== 'undefined' ? __CACHE_VERSION__ : 'dev';
const PRECACHE_NAME = `precache-${CACHE_VERSION}`;
const PAGE_CACHE = `pages-${CACHE_VERSION}`;
const FONT_CACHE = `font-${CACHE_VERSION}`;
const IMAGE_CACHE = `image-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline/index.html';

const PRECACHE_MANIFEST =
  typeof __PRECACHE_MANIFEST__ !== 'undefined' ? __PRECACHE_MANIFEST__ : [];
const PRECACHE_URLS = Array.from(new Set(PRECACHE_MANIFEST.map((entry) => entry.url)));

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((error) => {
        console.warn('[pwa] Precaching failed', error);
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const expectedCaches = new Set([PRECACHE_NAME, PAGE_CACHE, FONT_CACHE, IMAGE_CACHE]);
      const existingKeys = await caches.keys();
      await Promise.all(
        existingKeys
          .filter((key) => !expectedCaches.has(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (request.destination === 'font' && url.origin !== self.location.origin) {
    event.respondWith(cacheFirst(request, FONT_CACHE, 12));
    return;
  }

  if (request.destination === 'image' && url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, 60));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
  }
});

async function handleNavigationRequest(request) {
  const pageCache = await caches.open(PAGE_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      pageCache.put(request, networkResponse.clone()).catch(() => {
        /* ignore cache errors */
      });
    }
    return networkResponse;
  } catch (error) {
    const precached = await matchCachedResponse(request);
    if (precached) {
      return precached;
    }
    const offlineFallback = await matchCachedUrl(OFFLINE_URL);
    if (offlineFallback) {
      return offlineFallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      await trimCache(cacheName, maxEntries);
    }
    return response;
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cachedResponsePromise = cache.match(request);
  const networkResponsePromise = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
        await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  const cachedResponse = await cachedResponsePromise;
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await networkResponsePromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

async function trimCache(cacheName, maxEntries) {
  if (!maxEntries || maxEntries <= 0) {
    return;
  }

  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) {
    return;
  }

  const removeCount = keys.length - maxEntries;
  for (let i = 0; i < removeCount; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function matchCachedResponse(request) {
  const cacheNames = [PRECACHE_NAME, PAGE_CACHE];
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const directMatch = await cache.match(request);
    if (directMatch) {
      return directMatch;
    }

    const fallbackMatch = await matchAlternateUrls(cache, request);
    if (fallbackMatch) {
      return fallbackMatch;
    }
  }
  return undefined;
}

async function matchAlternateUrls(cache, request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return undefined;
  }

  const candidates = new Set();
  const pathname = url.pathname;
  candidates.add(pathname);

  if (pathname.endsWith('/')) {
    candidates.add(`${pathname}index.html`);
  } else {
    candidates.add(`${pathname}/index.html`);
  }

  for (const candidate of candidates) {
    const absolute = new URL(candidate, self.location.origin).toString();
    const match = (await cache.match(candidate)) || (await cache.match(absolute));
    if (match) {
      return match;
    }
  }

  return undefined;
}

async function matchCachedUrl(url) {
  const cache = await caches.open(PRECACHE_NAME);
  return (
    (await cache.match(url)) ||
    (await cache.match(new URL(url, self.location.origin).toString()))
  );
}
