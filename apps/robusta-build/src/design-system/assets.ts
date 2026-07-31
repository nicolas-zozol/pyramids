import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';

/**
 * The asset URL seam of the site.
 *
 * The design system exposes its raw assets through its exports map, so the
 * bundler resolves them to a hashed URL at build time and nothing is copied
 * into `public/`. What comes back depends on the bundler: Next.js hands over a
 * `StaticImageData`, other pipelines hand over a plain string. That
 * normalisation happens here, once for the whole site.
 *
 * Every consumer reads this export — the site configuration's `logo`, the home
 * page's `<BrandLogo wordmarkSrc={…}>`. `BrandLogo`'s own default is a
 * hardcoded `/_next/static/media/…` path that is wrong for any consumer, so the
 * prop is always passed explicitly.
 */
export const wordmarkSrc: string =
  typeof wordmark === 'string' ? wordmark : wordmark.src;
