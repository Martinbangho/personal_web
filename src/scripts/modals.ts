import { initPortfolioCarousels } from './portfolio-carousel';

const TRIGGER_SELECTOR = '[data-modal-target]';
const ACTIVE_CLASS = 'is-visible';
const BODY_LOCK_CLASS = 'modal-open';
const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Cleanup = () => void;

interface OverlayElements {
  root: HTMLElement;
  dialog: HTMLElement;
  content: HTMLElement;
}

function createOverlay(): OverlayElements {
  const root = document.createElement('div');
  root.className = 'modal-overlay';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = `
    <div class="modal-backdrop" data-modal-dismiss></div>
    <div class="modal-dialog" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" aria-label="Zavřít" data-modal-dismiss></button>
      <div class="modal-content" data-modal-content></div>
    </div>
  `;

  const dialog = root.querySelector<HTMLElement>('.modal-dialog');
  const content = root.querySelector<HTMLElement>('[data-modal-content]');

  if (!dialog || !content) {
    throw new Error('Modal overlay is missing required elements.');
  }

  document.body.appendChild(root);
  return { root, dialog, content };
}

function trapFocus(container: HTMLElement): Cleanup {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.tabIndex !== -1 &&
      (element.offsetParent !== null || element === container),
  );

  if (focusable.length === 0) {
    container.tabIndex = -1;
    container.focus();
    return () => container.removeAttribute('tabindex');
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
  first.focus({ preventScroll: true });

  return () => container.removeEventListener('keydown', handler);
}

function closestTrigger(element: EventTarget | null): HTMLElement | null {
  if (!(element instanceof HTMLElement)) return null;
  return element.closest<HTMLElement>(TRIGGER_SELECTOR);
}

export default function initModals() {
  if (typeof window === 'undefined') return;

  const triggers = document.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR);
  if (triggers.length === 0) return;

  const overlay = createOverlay();
  let activeModal: HTMLElement | null = null;
  let placeholder: Comment | null = null;
  let lastFocused: HTMLElement | null = null;
  let releaseFocus: Cleanup | null = null;

  const restore = () => {
    if (!activeModal) return;

    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(activeModal, placeholder);
      placeholder.remove();
    }

    activeModal.classList.add('mfp-hide');
    activeModal.hidden = true;
    activeModal.removeAttribute('role');
    activeModal.removeAttribute('aria-modal');
    activeModal.removeAttribute('tabindex');

    overlay.content.innerHTML = '';
    overlay.root.classList.remove(ACTIVE_CLASS);
    overlay.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove(BODY_LOCK_CLASS);
    document.removeEventListener('keydown', onKeyDown);

    releaseFocus?.();
    releaseFocus = null;

    if (lastFocused) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }

    activeModal = null;
    placeholder = null;
  };

  const open = (target: HTMLElement) => {
    if (activeModal === target) return;

    restore();

    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    placeholder = document.createComment('modal-placeholder');
    target.before(placeholder);

    overlay.content.innerHTML = '';
    overlay.content.appendChild(target);

    target.classList.remove('mfp-hide');
    target.hidden = false;
    target.setAttribute('role', 'document');

    overlay.root.classList.add(ACTIVE_CLASS);
    overlay.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add(BODY_LOCK_CLASS);

    initPortfolioCarousels(target);

    releaseFocus = trapFocus(overlay.dialog);

    activeModal = target;

    document.addEventListener('keydown', onKeyDown);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      restore();
      document.removeEventListener('keydown', onKeyDown);
    }
  };

  const getTargetFromTrigger = (trigger: HTMLElement | null) => {
    if (!trigger) return null;
    const selector = trigger.getAttribute('data-modal-target');
    if (!selector) return null;
    try {
      return document.querySelector<HTMLElement>(selector);
    } catch (error) {
      return null;
    }
  };

  const handleTrigger = (event: Event) => {
    const trigger = closestTrigger(event.target);
    if (!trigger) return;
    const target = getTargetFromTrigger(trigger);
    if (!target) return;
    event.preventDefault();
    open(target);
  };

  const handleDismiss = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target && target.closest('[data-modal-dismiss]')) {
      event.preventDefault();
      restore();
      document.removeEventListener('keydown', onKeyDown);
    }
  };

  document.addEventListener('click', handleTrigger);
  overlay.root.addEventListener('click', handleDismiss);
  overlay.content.addEventListener('click', handleTrigger);
}
