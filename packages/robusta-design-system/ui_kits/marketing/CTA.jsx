// CTA.jsx — closing call to action
function CTA() {
  return (
    <section style={{ padding: '80px 48px', textAlign: 'center', position: 'relative' }}>
      <img src="../../assets/crystal-tux-waving.svg" style={{ height: 140, marginBottom: 8 }}/>
      <h2 style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 76, margin: '12px 0 8px', lineHeight: 1 }}>
        ok, ready when you are.
      </h2>
      <p style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 19, color: '#2b2b2b', maxWidth: 540, margin: '0 auto 32px' }}>
        first call is 30 minutes, no slides. tell us what hurts.
        we'll tell you whether we're the right people to help.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="sk-input-wrap" style={{ width: 320, height: 52 }}>
          <input className="sk-input" placeholder="your email" style={{ height: 52 }}/>
        </div>
        <button className="sk-btn sk-btn--primary">book a call →</button>
      </div>
      <div style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14, color: '#6b6b66', marginTop: 18 }}>
        no newsletter funnel. one human reads it. promise.
      </div>
    </section>
  );
}
window.CTA = CTA;
