import { initCarousel } from './carousel';

const SELECTOR = '[data-carousel="testimonials"]';

const OPTIONS = {
  gap: 30,
  items: 1,
  breakpoints: [
    { width: 600, items: 2 },
    { width: 992, items: 2 },
  ],
  snap: 'start' as const,
};

export function initTestimonialCarousels(root: ParentNode = document) {
  if (typeof window === 'undefined') return;

  const carousels = root.querySelectorAll<HTMLElement>(SELECTOR);
  carousels.forEach((carousel) => {
    initCarousel(carousel, OPTIONS);
  });
}

export default function initTestimonialCarousel() {
  initTestimonialCarousels();
}
