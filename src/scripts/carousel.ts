export interface CarouselBreakpoint {
  width: number;
  items: number;
}

export interface CarouselOptions {
  gap?: number;
  items: number;
  breakpoints?: CarouselBreakpoint[];
  rootMargin?: number;
  snap?: 'start' | 'center';
}

export interface CarouselInstance {
  destroy: () => void;
  update: () => void;
}

const INITIALIZED_FLAG = 'data-carousel-initialized';
const DEFAULT_GAP = 24;
const SCROLL_DEBOUNCE = 100;

function resolveItemsPerView(options: CarouselOptions): number {
  const { breakpoints = [], items } = options;
  const sorted = [...breakpoints].sort((a, b) => a.width - b.width);
  let result = items;
  for (const breakpoint of sorted) {
    if (window.matchMedia(`(min-width: ${breakpoint.width}px)`).matches) {
      result = breakpoint.items;
    }
  }
  return Math.max(1, result);
}

function createDots(pageCount: number, activeIndex: number, onSelect: (index: number) => void) {
  const container = document.createElement('div');
  container.className = 'carousel-dots';
  for (let i = 0; i < pageCount; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-dot';
    button.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === activeIndex) {
      button.classList.add('is-active');
    }
    button.addEventListener('click', () => onSelect(i));
    container.appendChild(button);
  }
  return container;
}

function updateDotsState(dots: HTMLElement | null, activeIndex: number) {
  if (!dots) return;
  const buttons = dots.querySelectorAll<HTMLButtonElement>('button');
  buttons.forEach((button, index) => {
    button.classList.toggle('is-active', index === activeIndex);
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPageIndexFromScroll(
  container: HTMLElement,
  slides: HTMLElement[],
  itemsPerView: number,
): number {
  const scrollLeft = container.scrollLeft;
  let closestPage = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  const pageCount = Math.max(1, Math.ceil(slides.length / itemsPerView));

  for (let page = 0; page < pageCount; page += 1) {
    const slideIndex = clamp(page * itemsPerView, 0, slides.length - 1);
    const slide = slides[slideIndex];
    const distance = Math.abs(slide.offsetLeft - scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPage = page;
    }
  }

  return closestPage;
}

export function initCarousel(
  root: HTMLElement,
  options: CarouselOptions,
): CarouselInstance | null {
  if (root.hasAttribute(INITIALIZED_FLAG)) {
    return null;
  }

  const slides = Array.from(root.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );

  if (slides.length === 0) {
    return null;
  }

  const gap = options.gap ?? DEFAULT_GAP;
  let itemsPerView = resolveItemsPerView(options);
  let currentPage = 0;
  let dots: HTMLElement | null = null;
  let rafHandle = 0;

  root.classList.add('js-carousel');
  root.setAttribute(INITIALIZED_FLAG, 'true');
  root.style.setProperty('--carousel-gap', `${gap}px`);
  root.style.setProperty('--carousel-snap', options.snap ?? 'start');
  root.setAttribute('role', 'region');
  root.setAttribute('tabindex', '0');

  const renderDots = () => {
    dots?.remove();
    const pageCount = Math.max(1, Math.ceil(slides.length / itemsPerView));
    if (pageCount <= 1) {
      dots = null;
      return;
    }
    dots = createDots(pageCount, currentPage, (index) => {
      const slideIndex = clamp(index * itemsPerView, 0, slides.length - 1);
      const slide = slides[slideIndex];
      root.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
      currentPage = index;
      updateDotsState(dots, currentPage);
    });
    root.insertAdjacentElement('afterend', dots);
  };

  const applyLayout = () => {
    root.style.setProperty('--carousel-items', `${itemsPerView}`);
    slides.forEach((slide) => {
      slide.style.flex = `0 0 calc((100% - (var(--carousel-items, 1) - 1) * var(--carousel-gap, 0px)) / var(--carousel-items, 1))`;
      slide.style.scrollSnapAlign = options.snap ?? 'start';
    });
  };

  applyLayout();
  renderDots();

  let scrollTimeout: number | null = null;

  const onScroll = () => {
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
    scrollTimeout = window.setTimeout(() => {
      scrollTimeout = null;
      currentPage = getPageIndexFromScroll(root, slides, itemsPerView);
      updateDotsState(dots, currentPage);
    }, SCROLL_DEBOUNCE);
  };

  root.addEventListener('scroll', onScroll, { passive: true });

  const onResize = () => {
    cancelAnimationFrame(rafHandle);
    rafHandle = requestAnimationFrame(() => {
      const nextItems = resolveItemsPerView(options);
      if (nextItems !== itemsPerView) {
        itemsPerView = nextItems;
        applyLayout();
        renderDots();
        currentPage = getPageIndexFromScroll(root, slides, itemsPerView);
        updateDotsState(dots, currentPage);
      }
    });
  };

  window.addEventListener('resize', onResize);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const pageCount = Math.max(1, Math.ceil(slides.length / itemsPerView));
    const nextPage = clamp(currentPage + direction, 0, pageCount - 1);
    if (nextPage === currentPage) return;
    const slideIndex = clamp(nextPage * itemsPerView, 0, slides.length - 1);
    const slide = slides[slideIndex];
    root.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    currentPage = nextPage;
    updateDotsState(dots, currentPage);
  };

  root.addEventListener('keydown', onKeyDown);

  const destroy = () => {
    root.removeEventListener('scroll', onScroll);
    root.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    dots?.remove();
    root.removeAttribute(INITIALIZED_FLAG);
    slides.forEach((slide) => {
      slide.style.removeProperty('flex');
      slide.style.removeProperty('scroll-snap-align');
    });
  };

  const update = () => {
    itemsPerView = resolveItemsPerView(options);
    applyLayout();
    renderDots();
    currentPage = getPageIndexFromScroll(root, slides, itemsPerView);
    updateDotsState(dots, currentPage);
  };

  return { destroy, update };
}
