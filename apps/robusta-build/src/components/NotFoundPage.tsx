/** The site's not-found page, rendered on a document that loads no script. */
export function NotFoundPage() {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>page not found</h1>
      <p>Nothing is published at this address.</p>
      <p>
        <a href="/">back to the home page</a>
      </p>
    </main>
  );
}
