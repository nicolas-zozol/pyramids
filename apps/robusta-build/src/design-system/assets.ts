/**
 * Package design-system — the site's one seam onto the design system's asset URLs.
 *
 * Design: features/pyramid-v2-epic/__done/bootstrap-robusta-build/bootstrap-robusta-build.design.md
 * Requirements: R-BOOTSTRAP-28
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-50
 * Design: features/pyramid-v2-epic/__done/robusta-landing-page/robusta-landing-page.design.md
 * Requirements: R-LANDING-82
 */
import heroMascot from '@robusta/pyramids-design-system/assets/crystal-tux.svg';
import ctaMascot from '@robusta/pyramids-design-system/assets/crystal-tux-waving.svg';
import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.svg';

/**
 * The design system's wordmark, at the URL the bundler published it under.
 * `BrandLogo`'s own default is a hardcoded `/_next/static/media/…` path, so
 * every consumer passes this export explicitly.
 */
export const wordmarkSrc: string = wordmark;

/** `crystal-tux.svg`, the hero's mascot, at the URL the bundler published it under. */
export const heroMascotSrc: string = heroMascot;

/** `crystal-tux-waving.svg`, the closing block's mascot, at the URL the bundler published it under. */
export const ctaMascotSrc: string = ctaMascot;
