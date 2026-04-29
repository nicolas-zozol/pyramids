// SiteFooter.jsx
function SiteFooter() {
  return (
    <footer style={{
      padding: '36px 48px 56px',
      borderTop: '1.5px solid #1a1a1a',
      display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 36
    }}>
      <div>
        <BrandLogo size="compact"/>
        <p style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66',
          marginTop: 14, maxWidth: 280, lineHeight: 1.4
        }}>
          a small senior engineering practice.
          remote, distributed across europe + na.
        </p>
      </div>
      {[
        { h: 'work',    items: ['the audit', 'embedded eng', 'rebuild surgery', 'past projects'] },
        { h: 'notes',   items: ['all posts', 'rss', 'on github', 'on bsky'] },
        { h: 'company', items: ['about', 'engagement notes', 'contact', 'privacy'] }
      ].map(col => (
        <div key={col.h}>
          <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 26, color: '#1a1a1a' }}>{col.h}</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {col.items.map(it => (
              <li key={it}>
                <a href="#" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#1a1a1a', textDecoration: 'none' }}>{it}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 13, color: '#6b6b66',
        borderTop: '1.5px dashed #a8a59a', paddingTop: 20, marginTop: 12
      }}>
        <div>© robusta build · made by hand, with care.</div>
        <div>// v1.0 · the system you're reading is itself.</div>
      </div>
    </footer>
  );
}
window.SiteFooter = SiteFooter;
