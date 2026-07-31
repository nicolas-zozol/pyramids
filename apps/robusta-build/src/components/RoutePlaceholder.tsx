interface RoutePlaceholderProps {
  kind: string;
  url: string;
  facts: Record<string, string>;
}

/**
 * What every content route renders until the pages get their copy.
 *
 * This story produces URLs and route files; the rendering of the landing page,
 * the rolls and the articles belongs to robusta-landing-page and to
 * content-source. Showing the address the route resolved keeps the built output
 * readable while that copy is missing.
 */
export function RoutePlaceholder({ kind, url, facts }: RoutePlaceholderProps) {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>{kind}</h1>
      <p>
        <code>{url}</code>
      </p>
      <dl>
        {Object.entries(facts).map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>
              <code>{value}</code>
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
