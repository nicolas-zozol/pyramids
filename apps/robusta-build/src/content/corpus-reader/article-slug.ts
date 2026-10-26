// VERY IMPORTANT: DO NOT CHANGE THIS DERIVATION.
// A slug that moves breaks an indexed URL. Every row of the v1-to-v2 mapping in
// `apps/robusta-build/src/routing/v1-url-map.ts` was computed from the values
// this function produces, and the eleven migrated articles are addressed by
// them (R-CONTENTSOURCE-45). slugify stays at 1.6.6, `lower` and `strict`, and
// the locale is folded to lowercase before it reaches the charmap, which is what
// the v1 reader does at `apps/robusta/src/logic/posts.ts`.
import slugify from 'slugify';

export function articleSlug(title: string, locale: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: locale.toLowerCase(),
  });
}
