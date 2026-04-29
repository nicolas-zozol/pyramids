// ServicesGrid.jsx — three offerings as rough-box cards
function ServicesGrid() {
  const services = [
    {
      title: 'the audit',
      time:  '2–3 weeks · written report',
      body:  "we read your code, your incidents, and your last 6 months of prs. you get a 30-page memo with a ranked list of risks and a plan.",
      tag:   'most popular',
      tagClass: 'sk-tag--pink'
    },
    {
      title: 'embedded eng',
      time:  '1–2 quarters · on the team',
      body:  "we sit inside your team — pull rotation, code review, design docs, on-call. we leave you with a smaller backlog and an upgraded bench.",
      tag:   'high stakes',
      tagClass: 'sk-tag--blue'
    },
    {
      title: 'rebuild surgery',
      time:  '3–6 months · scoped',
      body:  "you have one piece that's holding the rest hostage. we replace it without rewriting the world. yes, postgres still works.",
      tag:   'scoped',
      tagClass: 'sk-tag--green'
    }
  ];

  return (
    <section id="work" style={{ padding: '64px 48px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15,
          color: '#6b6b66', marginBottom: 6
        }}>// what we do</div>
        <h2 style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 56, margin: 0, lineHeight: 1 }}>
          three ways we work.
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
        {services.map((s, i) => (
          <ServiceCard key={s.title} {...s} rotate={i % 2 === 0 ? '-0.4deg' : '0.4deg'}/>
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ title, time, body, tag, tagClass, rotate }) {
  return (
    <div style={{ position: 'relative', transform: `rotate(${rotate})` }}>
      {/* offset stamp behind */}
      <div style={{
        position: 'absolute', inset: '6px -6px -6px 6px',
        background: '#1a1a1a', zIndex: 0
      }}/>
      <div style={{
        position: 'relative', zIndex: 1, background: '#fafaf7',
        padding: '24px 26px 28px', minHeight: 220
      }}>
        {/* wobbly border */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'><path d='M3,4 Q40,2 100,3 T197,5 Q198,60 197,120 Q198,170 196,196 Q140,198 100,196 T6,196 Q3,140 4,80 T3,4 Z' fill='none' stroke='%231a1a1a' stroke-width='0.7'/></svg>")`,
          backgroundSize: '100% 100%'
        }}/>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <span className={`sk-tag ${tagClass}`}>{tag}</span>
          </div>
          <div style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 38, lineHeight: 1.1, marginBottom: 4
          }}>{title}</div>
          <div style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14,
            color: '#6b6b66', marginBottom: 14
          }}>{time}</div>
          <p style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 17, lineHeight: 1.45,
            color: '#2b2b2b', margin: 0
          }}>{body}</p>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#1a1a1a' }}>
            see how it works <span className="sk-arrow-right" style={{ width: 40 }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ServicesGrid = ServicesGrid;
