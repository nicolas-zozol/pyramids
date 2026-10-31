interface RoutePlaceholderProps {
  /** The heading, in the page's Locale: the blog title or the Category's label. */
  title: string;
  url: string;
}

/** What a listing route renders until the listings get their own page: its heading in the page's Locale and its address. */
export function RoutePlaceholder({ title, url }: RoutePlaceholderProps) {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>{title}</h1>
      <p>
        <code>{url}</code>
      </p>
    </main>
  );
}
