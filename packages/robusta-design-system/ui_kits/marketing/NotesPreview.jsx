// NotesPreview.jsx — engineering blog preview cards
function NotesPreview() {
  const posts = [
    { title: 'idempotency keys: a love letter',          tag: 'distributed systems', tagClass: 'sk-tag--blue', date: 'apr 12' },
    { title: 'the audit memo we send every client',      tag: 'process',             tagClass: '',             date: 'mar 28' },
    { title: 'why we still pick postgres',               tag: 'opinions',            tagClass: 'sk-tag--pink', date: 'mar 04' },
    { title: 'reading code is harder than writing it',   tag: 'craft',               tagClass: 'sk-tag--green',date: 'feb 19' }
  ];
  return (
    <section id="notes" style={{ padding: '64px 48px', background: '#f3f1ea' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66', marginBottom: 6 }}>// notes from the desk</div>
          <h2 style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 56, margin: 0, lineHeight: 1 }}>
            things we wrote down.
          </h2>
        </div>
        <a href="#" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 17, color: '#1a1a1a' }}>
          all notes <span className="sk-arrow-right" style={{ width: 50, verticalAlign: 'middle' }}></span>
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px 32px' }}>
        {posts.map((p, i) => (
          <a key={i} href="#" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 18, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1.5px dashed #a8a59a' }}>
            <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14, color: '#6b6b66', minWidth: 56, paddingTop: 4 }}>{p.date}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 21, color: '#1a1a1a', lineHeight: 1.25 }}>{p.title}</div>
              <div style={{ marginTop: 8 }}>
                {p.tag && <span className={`sk-tag ${p.tagClass}`}>{p.tag}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
window.NotesPreview = NotesPreview;
