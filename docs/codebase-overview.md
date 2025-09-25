# Codebase Overview

This document introduces the structure of the `personal_web` project so a new contributor can orient themselves quickly.

## Technology stack

- **Astro 4** – static-first site generator used for every page under `src/pages`. Server rendering is only added where needed (for example the contact API route).
- **Astro Content Collections** – services are stored as Markdown pairs in `src/content/services` and validated by the schema in `src/content/config.ts`.
- **TypeScript utilities** – helper functions under `src/utils` centralise SEO metadata, alternate language links and service lookups.
- **Modular styling** – design tokens and resets live in `src/styles/tokens.css` and `src/styles/base.css`; scoped component styles are organised under `src/styles/components`, `src/styles/landing` and `src/styles/services`.
- **Progressive enhancement** – small ES modules in `src/scripts` provide optional interactions (navigation, carousels, contact form handling) and are hydrated lazily from the Astro components that require them.
- **PWA tooling** – the build integrates a local copy of `@vite-pwa/astro` to generate the precache manifest consumed by `public/sw.js`.

## Repository layout

```
.
├── docs/                    Additional architecture notes (API, interactions, PWA)
├── public/                  Static assets served verbatim (icons, legacy fallback pages, service worker)
├── src/
│   ├── components/          Reusable Astro components such as navigation, footer and responsive images
│   ├── content/             Markdown content collections for services (CS/EN pairs)
│   ├── data/                TypeScript data sources for navigation, social links and media assets
│   ├── layouts/             Shared page layouts (currently `Base.astro`)
│   ├── pages/               Route definitions including home pages, service detail pages and API routes
│   ├── scripts/             TypeScript ES modules providing optional client-side behaviour
│   ├── styles/              Global tokens/base styles plus component- or page-specific CSS
│   └── utils/               Helper functions for SEO tags and content collection access
├── astro.config.mjs         Astro project configuration (site URL, integrations, build output)
├── package.json             npm scripts and dependencies
└── tsconfig.json            TypeScript configuration shared by Astro and scripts
```

### Pages and layouts
- `src/layouts/Base.astro` wraps every page with the navigation (`MainNav`), footer and shared `<head>` metadata helpers.
- `src/pages/index.astro` and `src/pages/en/index.astro` are the Czech and English landing pages.
- Service detail pages are generated from content collections via the Astro endpoints in `src/pages/sluzby/[slug].astro` and `src/pages/en/services/[slug].astro`.
- `src/pages/api/contact.ts` implements the serverless contact form endpoint backed by the helper described in `docs/contact-api.md`.
- `src/pages/offline.astro` provides the offline fallback used by the service worker.

### Data & SEO
- Navigation data (links, CTA buttons, locale switchers) is centralised in `src/data/navigation.ts` and rendered through `src/components/MainNav.astro`.
- Social links and footer contact details live in `src/data/socials.ts` and are consumed by `src/components/Footer.astro`.
- SEO helpers in `src/utils/seo.ts` compute canonical URLs, `hreflang` alternates and JSON-LD fragments for every page.

### Styles & scripts
- Design system tokens (colours, spacing, typography) are defined in `src/styles/tokens.css`.
- Global resets and base layout rules sit in `src/styles/base.css`.
- The landing and services directories contain CSS modules that are imported by individual components for scoped styling.
- Client-side scripts in `src/scripts` are imported with Astro directives such as `client:idle` so that JavaScript only runs when required.

### Legacy assets
- The `public/` folder still hosts a handful of legacy HTML pages (e.g. legal documents, thank-you pages) and assets. They continue to work because Astro copies them to the final build output. When time allows, consider migrating them into Astro pages so they benefit from the shared layout and data sources.

## Getting started locally
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Visit the printed localhost URL to browse the site. Astro supports hot-module reloading for components, styles and Markdown content.
4. Build a production bundle with `npm run build`; preview the result via `npm run preview`.

## Continuous integration
- Pull requests and pushes trigger the `CI` workflow defined in `.github/workflows/ci.yml`. The job installs dependencies with `npm ci`, runs any available lint or unit test scripts, builds the production bundle and audits the generated output with Lighthouse CI (home page and a representative service detail page).
- Lighthouse scores are exported to the workflow summary and the full HTML reports are uploaded as build artifacts so reviewers can inspect them without re-running the audit locally.
- Mark the `CI` workflow status as **required** in the repository settings before deploying so regressions in build, tests or performance metrics block merges.


## Suggested next steps for new contributors
- Read `docs/interactions.md` to understand the philosophy behind the JavaScript modules and how hydration is controlled.
- Study `docs/contact-api.md` before touching the serverless form handler or environment secrets.
- Review `docs/pwa.md` when modifying the service worker or cache configuration.
- Familiarise yourself with Astro Content Collections by browsing `src/content/services` and the associated utilities in `src/utils/services.ts`.
- When adding new sections or services, keep Czech and English content aligned by creating paired Markdown entries and extending the navigation data.

Happy building!
