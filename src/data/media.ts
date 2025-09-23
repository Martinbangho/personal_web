import type { ResponsiveImageProps, ResponsiveSource } from '../components/ResponsiveImage.astro';

const assetUrl = (path: string) =>
  new URL(`../../public/assets/${path}`, import.meta.url);

export type ImageSource = ResponsiveSource;

export type ImageMetadata = Pick<
  ResponsiveImageProps,
  'src' | 'width' | 'height' | 'srcset' | 'sizes' | 'sources'
>;

type ImageMap = Record<string, ImageMetadata>;

type GalleryMap = Record<string, ImageMetadata[]>;

export const heroPortrait: ImageMetadata = {
  src: assetUrl('img/hero/me.png'),
  width: 1920,
  height: 1920,
  sources: [
    {
      type: 'image/webp',
      srcset: assetUrl('img/hero/me.webp'),
    },
  ],
};

export const testimonialPortraits: ImageMap = {
  kejval: {
    src: assetUrl('img/testimonials/user/kejval.jpg'),
    width: 491,
    height: 491,
  },
  zatkovic: {
    src: assetUrl('img/testimonials/user/zatkovic.webp'),
    width: 1365,
    height: 1365,
  },
  vlcek: {
    src: assetUrl('img/testimonials/user/vlcek.jpg'),
    width: 1310,
    height: 1310,
  },
  kapic: {
    src: assetUrl('img/testimonials/user/kapic.jpg'),
    width: 1638,
    height: 1638,
  },
  architekti: {
    src: assetUrl('img/testimonials/user/architekti.jpg'),
    width: 300,
    height: 300,
  },
};

export const portfolioGalleryImages: GalleryMap = {
  o2: [
    {
      src: assetUrl('img/portfolio-gallery/o2_2.png'),
      width: 1119,
      height: 560,
    },
    {
      src: assetUrl('img/portfolio-gallery/o2_3.png'),
      width: 1114,
      height: 557,
    },
    {
      src: assetUrl('img/portfolio-gallery/o2_4.png'),
      width: 1114,
      height: 557,
    },
    {
      src: assetUrl('img/portfolio-gallery/o2_5.png'),
      width: 600,
      height: 300,
    },
  ],
  sofa: [
    {
      src: assetUrl('img/portfolio-gallery/sofa_2.png'),
      width: 1617,
      height: 808,
    },
    {
      src: assetUrl('img/portfolio-gallery/sofa_3.png'),
      width: 1699,
      height: 850,
    },
    {
      src: assetUrl('img/portfolio-gallery/sofa_4.png'),
      width: 1701,
      height: 850,
    },
    {
      src: assetUrl('img/portfolio-gallery/sofa_5.png'),
      width: 1703,
      height: 852,
    },
  ],
  security: [
    {
      src: assetUrl('img/portfolio-gallery/avast.png'),
      width: 1631,
      height: 842,
    },
    {
      src: assetUrl('img/portfolio-gallery/norton.png'),
      width: 1612,
      height: 833,
    },
    {
      src: assetUrl('img/portfolio-gallery/lifelock.png'),
      width: 1612,
      height: 861,
    },
  ],
};

export const iconImages: ImageMap = {
  n8n: {
    src: assetUrl('img/icons/n8n.png'),
    width: 500,
    height: 500,
  },
};
