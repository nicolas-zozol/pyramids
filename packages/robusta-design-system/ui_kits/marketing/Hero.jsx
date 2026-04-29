// Hero.jsx — main pitch + crystal tux + scribble underlines
function Hero() {
  return (
    <section style={{ padding: '64px 48px 32px', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            fontSize: 17, color: '#6b6b66', marginBottom: 18
          }}>
            <span className="sk-arrow-right" style={{ width: 38, marginRight: 8, verticalAlign: 'middle' }}></span>
            independent senior engineering
          </div>
          <h1 style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontWeight: 700,
            fontSize: 88, lineHeight: 1.05, margin: 0, letterSpacing: '-1px'
          }}>
            we build software<br/>
            you can still <span className="sk-scribble" style={{marginRight: 14}}>maintain</span> in<br/>
            <span className="highlight-yellow">five years.</span>
          </h1>
          <p style={{
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 21, lineHeight: 1.45,
            color: '#2b2b2b', marginTop: 28, maxWidth: 520
          }}>
            small team. long memory. for high-stakes systems where
            <span className="highlight-blue"> architecture, reliability, and the next engineer</span> all matter.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
            <button className="sk-btn sk-btn--primary">book a call →</button>
            <button className="sk-btn">read a sample audit</button>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 28,
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 15, color: '#6b6b66'
          }}>
            <span className="sk-check"></span>
            currently booking q3 · 2 slots left this quarter
          </div>
        </div>

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <img src="../../assets/crystal-tux.svg" style={{ height: 360 }} alt="crystal tux"/>
          {/* annotation arrows pointing at tux */}
          <div style={{
            position: 'absolute', top: 30, right: 0,
            fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14, color: '#6b6b66',
            transform: 'rotate(4deg)'
          }}>
            this is crystal tux.<br/>
            she lives here.
          </div>
          <svg style={{ position: 'absolute', top: 60, right: 50, width: 80, height: 60 }} viewBox="0 0 80 60">
            <path d="M70,10 Q40,20 20,40" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M22,32 L18,42 L28,42" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
