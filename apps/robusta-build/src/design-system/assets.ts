/**
 * Package design-system — the site's one seam onto the design system's asset URLs.
 *
 * Design: features/pyramid-v2-epic/bootstrap-robusta-build/bootstrap-robusta-build.design.md
 * Requirements: R-BOOTSTRAP-28
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-50
 */
import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';

/**
 * The design system's wordmark, at the URL the bundler published it under.
 * `BrandLogo`'s own default is a hardcoded `/_next/static/media/…` path, so
 * every consumer passes this export explicitly.
 */
export const wordmarkSrc: string = wordmark;
