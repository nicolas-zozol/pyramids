/** The site's not-found page, rendered on a document that loads no script. */
export function NotFoundPage() {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>page introuvable</h1>
      <p>Aucune page n’est publiée à cette adresse.</p>
      <p>
        <a href="/">retour à l’accueil</a>
      </p>
    </main>
  );
}
