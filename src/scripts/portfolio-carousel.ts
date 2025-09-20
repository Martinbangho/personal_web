import { initCarousel } from './carousel';

const SELECTOR = '[data-carousel="portfolio"]';

const OPTIONS = {
  gap: 30,
  items: 1,
  breakpoints: [
    { width: 768, items: 2 },
    { width: 992, items: 2 },
  ],
  snap: 'center' as const,
};

export function initPortfolioCarousels(root: ParentNode = document) {
  if (typeof window === 'undefined') return;

  const galleries = root.querySelectorAll<HTMLElement>(SELECTOR);
  galleries.forEach((gallery) => {
    initCarousel(gallery, OPTIONS);
  });
}

export default function initPortfolioCarousel() {
  initPortfolioCarousels();
}
