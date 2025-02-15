This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Routing

We have 3 discriminant for routes:

- locale. If empty, 'en'. Can be 'fr'.
- `page` : Blog roll current page
- `p` : signifies a blog post (or product)
  - it will avoid to search into the database for a slug

Discriminants are needed so that NextJS can do pregeneration at
build time with ISR. If not, we would require searchParams
than can be done only at runtime.

- `/`: Home page
- `/portfolio` : Portfolio page
- `/fr/portfolio/` : Portfolio page in French
- `/learn` : Blog homepage
- `/learn/fr` : Blog homepage in French
- `/learn/blockchain` : Blog category page
- `/learn/blockchain/page/2` : Blog category page
- `/learn/blockchain/p/what-is-blockchain` : Blog post page
- `/learn/fr/blockchain/` : Blog category page in French
- `/learn/fr/blockchain/page/2` : Blog category page in French
- `/learn/fr/blockchain/p/voici-la-blockchain/` : Blog post page in French
- `/learn/blockchain/security` : Blog category page
- `/learn/blockchain/security/page/2` : Blog category page
