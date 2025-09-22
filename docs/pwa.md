# PWA a cache strategie

Aktualizovaný build používá integraci `@vite-pwa/astro`, která po dokončení Astro buildu projde složku `dist/`, spočítá hash obsahu jednotlivých souborů a vytvoří precache manifest. Ten se následně automaticky vloží do `public/sw.js` na místo placeholderu `__PRECACHE_MANIFEST__` a zároveň se zapíše aktuální build hash do `__CACHE_VERSION__`. Generovaný soubor `pwa-manifest-<hash>.json` ve složce `dist/` slouží jako reference při ladění buildu.

## Verzionované cache
Service worker vytváří několik cache s názvy odvozenými od build hashe:

- `precache-<hash>` – obsahuje všechny položky z manifestu včetně fallback stránky `/offline/index.html`.
- `pages-<hash>` – uchovává odpovědi pro navigační požadavky, aby se při výpadku sítě zobrazil poslední dostupný obsah.
- `font-<hash>` – `Cache First` strategie pro externí fonty (například z Google Fonts).
- `image-<hash>` – `Stale While Revalidate` strategie pro externí obrázky a avatary.

Při aktivaci service worker porovná aktuální seznam cache s očekávanými názvy a všechny starší verze odstraní. Díky tomu se při každém novém buildu automaticky vyčistí zastaralý obsah.

## Offline fallback
Stránka `src/pages/offline.astro` se vyrenderuje do `/offline/index.html` a je součástí precache manifestu. Navigační požadavky používají `Network First` strategii – při selhání sítě se nejprve hledá uložená kopie stránky a pokud není k dispozici, obslouží se právě offline fallback. Kontaktní formuláře v offline režimu nespadnou na chybovou stránku – `contact-form.ts` si pokusy frontuje v paměti a znovu je odešle po obnovení připojení.

## Runtime strategie
- **Externí fonty**: požadavky s `request.destination === 'font'` a cizím původem využívají `Cache First` strategii s omezením 12 položek.
- **Externí obrázky**: požadavky s `request.destination === 'image'` a cizím původem využívají `Stale While Revalidate` s limitem 60 položek.

## Testování a preview
Po instalaci závislostí spusťte `npm run build`. Výstup ve složce `dist/` obsahuje již doplněný manifest i verzované názvy cache. Pro ruční ověření aktualizace service worker a cache spusťte `npm run preview`, otevřete stránku v prohlížeči, zaregistrujte service worker a následně opakujte build/preview – nová verze cache se nahradí automaticky díky hashi buildu.
