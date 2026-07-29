// PrinciplesList.jsx — values written like sketchnote bullets
function PrinciplesList() {
  const items = [
    { k: 'we read before we write.',          v: 'no commits in the first week. promise.' },
    { k: 'boring tech, on purpose.',          v: 'postgres, sql, http. fewer moving parts is the feature.' },
    { k: 'the next engineer matters most.',   v: 'every choice is a memo to whoever inherits it.' },
    { k: "we don't take work we can't finish.", v: 'small slate. long horizons. quarter-shaped projects.' },
    { k: 'tests are documentation.',          v: 'if it isn\'t covered, we don\'t know how it should behave.' },
    { k: 'incidents are not surprises.',      v: 'they are the signal that an invariant was wrong.' }
  ];
  return (
    <section style={{ padding: '72px 48px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66', marginBottom: 6 }}>// what we believe</div>
        <h2 style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 56, margin: 0, lineHeight: 1 }}>
          principles, written down.
        </h2>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 56px' }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span className="sk-check" style={{ flexShrink: 0, marginTop: 4 }}></span>
            <div>
              <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontWeight: 700, fontSize: 19, color: '#1a1a1a', lineHeight: 1.3 }}>{it.k}</div>
              <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66', marginTop: 2 }}>{it.v}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
window.PrinciplesList = PrinciplesList;
