// FlowDiagram.jsx — "how an engagement runs" flow chart
function FlowDiagram() {
  const steps = [
    { n: 1, label: 'hello',     sub: '30 min, free' },
    { n: 2, label: 'scope',     sub: '1 page, written' },
    { n: 3, label: 'audit',     sub: '2–3 weeks' },
    { n: 4, label: 'work',      sub: 'embedded or scoped' },
    { n: 5, label: 'handoff',   sub: 'docs + a memo' }
  ];
  return (
    <section id="approach" style={{
      padding: '64px 48px',
      background: '#fafaf7',
      backgroundImage: 'radial-gradient(#a8a59a 1px, transparent 1px)',
      backgroundSize: '22px 22px',
      backgroundPosition: '11px 11px',
      borderTop: '1.5px dashed #a8a59a',
      borderBottom: '1.5px dashed #a8a59a'
    }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66', marginBottom: 6 }}>// how an engagement runs</div>
        <h2 style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 56, margin: 0, lineHeight: 1 }}>
          no surprises. just <span className="highlight-pink">five steps.</span>
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div style={{ textAlign: 'center', minWidth: 110 }}>
              <span className="sk-circle" style={{ width: 72, height: 72, fontSize: 32, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>{s.n}</span>
              <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 28, marginTop: 8, lineHeight: 1 }}>{s.label}</div>
              <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 13, color: '#6b6b66', marginTop: 4 }}>{s.sub}</div>
            </div>
            {i < steps.length - 1 && <span className="sk-arrow-right" style={{ width: 64 }}></span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{
        marginTop: 36, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16
      }}>
        <img src="../../assets/crystal-tux-thinking.svg" style={{ height: 110 }}/>
        <div className="sk-callout" style={{ maxWidth: 320 }}>
          <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15 }}>
            we'll say no if your problem isn't a fit. honestly, that happens about 1 in 3 calls.
          </div>
        </div>
      </div>
    </section>
  );
}
window.FlowDiagram = FlowDiagram;
