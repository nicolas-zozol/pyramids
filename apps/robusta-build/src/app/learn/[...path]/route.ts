/**
 * The Gone handler of the retired `/learn` namespace (R-URLSCHEME-25).
 *
 * `redirects()` cannot answer anything that is not a redirect, so the 410 needs
 * its own mechanism, and a route handler is the cheapest one that is not
 * middleware. It reads nothing at all — no content source, no article index, no
 * filesystem — so it is dynamic without violating BR-PYRAMID-7.
 *
 * `/learn` itself never reaches it: a redirect claims it first, as does every
 * URL a redirect rule matches, because configuration redirects are evaluated
 * ahead of the filesystem. What remains is the retired namespace, which is the
 * whole point.
 *
 * Gone is scoped to documents. A path carrying an `images` segment falls
 * through to 404: where the 73 images published under `public/learn/**` end up
 * on v2 is migrate-learn-content's deliverable, and asserting a deliberate
 * retirement for an image about to be republished at another URL is the one
 * thing 410 should not be used for.
 */
export const dynamic = 'force-dynamic';

const IMAGE_SEGMENT = 'images';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (path.includes(IMAGE_SEGMENT)) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(
    'Gone. The /learn section of robusta.build has been retired.',
    {
      status: 410,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    },
  );
}
