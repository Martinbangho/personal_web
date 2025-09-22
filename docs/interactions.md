# Front-end Interactions

This project no longer relies on legacy jQuery bundles. Interactivity is provided by small ES modules stored in [`src/scripts/`](../src/scripts).

## Available modules

- `navigation.ts` – handles the sticky header, mobile drawer and submenu toggles. Import it from components that render the navigation (e.g. `MainNav.astro`) and initialise it on `requestIdleCallback`/`load`.
- `show-more.ts` – toggles additional service cards. Buttons can override their labels with `data-collapsed-label` and `data-expanded-label` attributes.
- `portfolio-carousel.ts` & `testimonial-carousel.ts` – lightweight carousel initialisers used on landing pages and portfolio modals.
- `modals.ts` – enables inline modal windows referenced via `data-modal-target` attributes.
- `contact-form.ts` – progressively enhances forms marked with `data-contact-form` to submit JSON requests to `/api/contact`, display inline status messages, and queue retries while the user is offline.

Shared slider styling lives in [`src/styles/components/carousel.css`](../src/styles/components/carousel.css) and modal styling in [`src/styles/components/modal.css`](../src/styles/components/modal.css).

## Initialisation pattern

To keep the critical path small, modules are lazily imported using `requestIdleCallback` with a `load` fallback:

```astro
<script type="module" is:inline>
  const loadInteractions = async () => {
    const [{ default: initModals }] = await Promise.all([
      import('../scripts/modals.ts'),
    ]);
    initModals();
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadInteractions);
  } else {
    window.addEventListener('load', loadInteractions, { once: true });
  }
</script>
```

Use this pattern to add interaction modules to new pages. Only import the modules that are required for that page.
