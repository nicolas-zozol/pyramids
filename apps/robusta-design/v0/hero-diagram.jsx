// Hero feature visual: a hand-drawn-style system diagram, like an engineer's notebook
function HeroDiagram() {
  return (
    <div className="hero-diagram">
      <div className="hero-diagram-frame">
        <span className="corner tl"></span>
        <span className="corner tr"></span>
        <span className="corner bl"></span>
        <span className="corner br"></span>

        <svg viewBox="0 0 880 280" preserveAspectRatio="xMidYMid meet"
          style={{width:"100%", height:"auto", display:"block"}}>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/>
            </marker>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeOpacity="0.18"/>
            </pattern>
          </defs>

          {/* notebook annotations top */}
          <g fontFamily="var(--font-mono)" fontSize="11" fill="currentColor" opacity="0.55" letterSpacing="0.5">
            <text x="20" y="22">fig. 01 — what i actually do</text>
            <text x="860" y="22" textAnchor="end">sketch · not to scale</text>
          </g>

          {/* clients (left) */}
          <g>
            <rect x="40" y="80" width="120" height="42" fill="none" stroke="currentColor" strokeWidth="1.2"/>
            <text x="100" y="106" textAnchor="middle" fontFamily="var(--font-display)" fontSize="16" fill="currentColor">your team</text>
            <text x="100" y="138" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="currentColor" opacity="0.55">CTO · staff eng · PM</text>
          </g>

          {/* arrow problems */}
          <g stroke="currentColor" fill="currentColor">
            <line x1="160" y1="100" x2="290" y2="100" markerEnd="url(#arr)" strokeWidth="1.2"/>
            <text x="225" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" opacity="0.6">problems</text>
          </g>

          {/* the work — center, accented */}
          <g>
            <rect x="290" y="60" width="300" height="160" fill="url(#hatch)" stroke="var(--accent)" strokeWidth="1.5"/>
            <rect x="290" y="60" width="300" height="22" fill="var(--accent)" opacity="0.12"/>
            <text x="440" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)" letterSpacing="2">THE WORK</text>

            <g fontFamily="var(--font-display)" fontSize="15" fill="currentColor">
              <text x="310" y="108">→ read the source</text>
              <text x="310" y="132">→ draw the right diagram</text>
              <text x="310" y="156">→ write the migration</text>
              <text x="310" y="180">→ make it reversible</text>
              <text x="310" y="204">→ leave the docs</text>
            </g>
          </g>

          {/* arrow outputs */}
          <g stroke="currentColor" fill="currentColor">
            <line x1="590" y1="120" x2="700" y2="80" markerEnd="url(#arr)" strokeWidth="1.2" opacity="0.7"/>
            <line x1="590" y1="160" x2="700" y2="160" markerEnd="url(#arr)" strokeWidth="1.2" opacity="0.7"/>
            <line x1="590" y1="200" x2="700" y2="240" markerEnd="url(#arr)" strokeWidth="1.2" opacity="0.7"/>
          </g>

          {/* outputs */}
          <g fontFamily="var(--font-display)" fontSize="15" fill="currentColor">
            <text x="710" y="78">software that ships</text>
            <text x="710" y="160">essays you can read</text>
            <text x="710" y="240">open source you can fork</text>
          </g>
          <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55">
            <text x="710" y="92">— in production</text>
            <text x="710" y="174">— public, since 2021</text>
            <text x="710" y="254">— 4 repos · 7.5k ★</text>
          </g>

          {/* margin note */}
          <g>
            <line x1="100" y1="180" x2="100" y2="220" stroke="currentColor" strokeOpacity="0.4"/>
            <text x="100" y="240" textAnchor="middle" fontFamily="var(--font-display)"
              fontStyle="italic" fontSize="13" fill="currentColor" opacity="0.7">often confused</text>
            <text x="100" y="256" textAnchor="middle" fontFamily="var(--font-display)"
              fontStyle="italic" fontSize="13" fill="currentColor" opacity="0.7">with consulting.</text>
            <text x="100" y="272" textAnchor="middle" fontFamily="var(--font-display)"
              fontStyle="italic" fontSize="13" fill="currentColor" opacity="0.7">it isn't.</text>
          </g>
        </svg>
      </div>

      <div className="hero-diagram-caption">
        <span><span className="num">fig. 01</span>&nbsp;&nbsp;the engagement loop</span>
        <span>drawn 04 / 2026</span>
      </div>
    </div>
  );
}

window.HeroDiagram = HeroDiagram;
