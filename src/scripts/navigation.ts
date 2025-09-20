const STICKY_CLASS = 'sticky-menu';
const STICKY_SCROLL_THRESHOLD = 200;
const DRAWER_OPEN_CLASS = 'show';
const OVERLAY_ACTIVE_CLASS = 'active';
const BODY_LOCK_CLASS = 'on-side';
const OPEN_TRIGGER_SELECTOR = '.hamburger-menu > a';
const CLOSE_TRIGGER_SELECTOR = '.close-mobile-menu > a';
const DRAWER_SELECTOR = '.slide-bar';
const OVERLAY_SELECTOR = '.body-overlay';
const HEADER_SELECTOR = '.main-header-area';
const MOBILE_MENU_SELECTOR = '#mobile-menu-active';
const SUBMENU_PARENT_SELECTOR = 'li.has-dropdown';
const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ToggleTarget = HTMLElement | null;

function toggleStickyHeader(header: HTMLElement, scrollY: number) {
  if (scrollY > STICKY_SCROLL_THRESHOLD) {
    header.classList.add(STICKY_CLASS);
  } else {
    header.classList.remove(STICKY_CLASS);
  }
}

function initStickyHeader() {
  const header = document.querySelector<HTMLElement>(HEADER_SELECTOR);
  if (!header) return;

  toggleStickyHeader(header, window.scrollY);
  window.addEventListener(
    'scroll',
    () => toggleStickyHeader(header, window.scrollY),
    { passive: true },
  );
}

function setAriaExpanded(element: HTMLElement, expanded: boolean) {
  element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function trapFocus(container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.offsetParent !== null || el === container);

  if (focusable.length === 0) {
    container.tabIndex = -1;
    container.focus();
    return () => {
      container.removeAttribute('tabindex');
    };
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handler);
  first.focus();

  return () => container.removeEventListener('keydown', handler);
}

function initMobileSubmenus(menuRoot: HTMLElement) {
  const parents = menuRoot.querySelectorAll<HTMLElement>(SUBMENU_PARENT_SELECTOR);

  parents.forEach((parent) => {
    const trigger = parent.querySelector<HTMLAnchorElement>('a');
    const submenu = parent.querySelector<HTMLElement>('ul');
    if (!trigger || !submenu) return;

    submenu.hidden = true;
    parent.classList.remove('is-open');
    setAriaExpanded(trigger, false);

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = parent.classList.toggle('is-open');
      submenu.hidden = !isOpen;
      setAriaExpanded(trigger, isOpen);
    });
  });
}

function initMobileMenu() {
  const drawer = document.querySelector<HTMLElement>(DRAWER_SELECTOR);
  const overlay = document.querySelector<HTMLElement>(OVERLAY_SELECTOR);
  const openTrigger = document.querySelector<HTMLElement>(OPEN_TRIGGER_SELECTOR);
  const closeTrigger = document.querySelector<HTMLElement>(CLOSE_TRIGGER_SELECTOR);
  const body = document.body;

  if (!drawer || !overlay || !openTrigger) return;

  setAriaExpanded(openTrigger, false);

  let restoreFocus: (() => void) | null = null;
  let lastFocused: ToggleTarget = null;

  const openDrawer = () => {
    if (drawer.classList.contains(DRAWER_OPEN_CLASS)) return;
    lastFocused = (document.activeElement as HTMLElement) ?? null;
    drawer.classList.add(DRAWER_OPEN_CLASS);
    overlay.classList.add(OVERLAY_ACTIVE_CLASS);
    body.classList.add(BODY_LOCK_CLASS);
    setAriaExpanded(openTrigger, true);
    restoreFocus = trapFocus(drawer);
  };

  const closeDrawer = () => {
    if (!drawer.classList.contains(DRAWER_OPEN_CLASS)) return;
    drawer.classList.remove(DRAWER_OPEN_CLASS);
    overlay.classList.remove(OVERLAY_ACTIVE_CLASS);
    body.classList.remove(BODY_LOCK_CLASS);
    setAriaExpanded(openTrigger, false);
    if (restoreFocus) {
      restoreFocus();
      restoreFocus = null;
    }
    if (lastFocused) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  };

  openTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (drawer.classList.contains(DRAWER_OPEN_CLASS)) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    closeDrawer();
  });

  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeDrawer();
    }
  });

  const mobileMenu = document.querySelector<HTMLElement>(MOBILE_MENU_SELECTOR);
  if (mobileMenu) {
    initMobileSubmenus(mobileMenu);
  }
}

export default function initNavigation() {
  if (typeof window === 'undefined') return;
  initStickyHeader();
  initMobileMenu();
}
