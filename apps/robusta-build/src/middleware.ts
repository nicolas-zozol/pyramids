import { NextResponse, type NextRequest } from 'next/server';

/**
 * Case normalization, the only middleware the site carries.
 *
 * It is the fourth family of R-URLSCHEME-10 and the only one Next does not give
 * for free: the trailing slash is already normalised by `trailingSlash: false`,
 * and the marked default locale and the explicit page one are `redirects()`
 * rules.
 *
 * The matcher is what keeps it cheap and keeps it out of the way. It fires only
 * on paths that contain an uppercase letter, so normal traffic never reaches
 * it, and it excludes `/learn` so the v1 mapping keeps matching the addresses as
 * they were published — `/learn/tag/DeFi` included. `_next` is excluded too:
 * a build asset whose hashed file name carries an uppercase letter must not be
 * redirected to a path that does not exist.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.toLowerCase();
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!learn/|learn$|_next/)(?=[^?]*[A-Z]).*)'],
};
