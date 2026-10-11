interface FailedNavigationPageProps {
  /** The address whose navigation failed. */
  href: string;
}

/** The error state of a navigation that failed twice: retry the address, or go back home. */
export function FailedNavigationPage({ href }: FailedNavigationPageProps) {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>cette page n’a pas pu se charger</h1>
      <p>
        <a href={href}>réessayer cette adresse</a> ou{' '}
        <a href="/">revenir à l’accueil</a>.
      </p>
    </main>
  );
}
