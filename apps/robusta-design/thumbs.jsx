// Inline SVG thumbnails per project — each represents what the project DOES

function ThumbMasala() {
  // Parser combinators: a small AST tree
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="msl-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="320" height="180" fill="url(#msl-grid)" />
      {/* AST tree */}
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <line x1="160" y1="40" x2="100" y2="80" opacity="0.5"/>
        <line x1="160" y1="40" x2="220" y2="80" opacity="0.5"/>
        <line x1="100" y1="80" x2="70" y2="130" opacity="0.5"/>
        <line x1="100" y1="80" x2="130" y2="130" opacity="0.5"/>
        <line x1="220" y1="80" x2="190" y2="130" opacity="0.5"/>
        <line x1="220" y1="80" x2="250" y2="130" opacity="0.5"/>
      </g>
      {[
        [160, 40, "expr", true],
        [100, 80, "·then", false],
        [220, 80, "·or", false],
        [70, 130, "id", false],
        [130, 130, "lit", false],
        [190, 130, "lit", false],
        [250, 130, "id", false],
      ].map(([x, y, l, accent], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="var(--paper)"
            stroke={accent ? "var(--accent)" : "currentColor"}
            strokeWidth={accent ? 1.5 : 1}
            strokeOpacity={accent ? 1 : 0.6}/>
          <text x={x} y={y + 3} textAnchor="middle" fontFamily="var(--font-mono)"
            fontSize="9" fill={accent ? "var(--accent)" : "currentColor"}>{l}</text>
        </g>
      ))}
      <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55">
        <text x="16" y="22">parse("a + b")</text>
        <text x="304" y="22" textAnchor="end">→ AST</text>
        <text x="16" y="170">combinator: then ⊕ or</text>
      </g>
    </svg>
  );
}

function ThumbSwaap() {
  // DeFi: a price/volume chart with TVL annotation
  const points = [
    [16, 130], [40, 125], [60, 118], [80, 110],
    [100, 105], [120, 88], [140, 82], [160, 70],
    [180, 60], [200, 50], [220, 44], [240, 38],
    [260, 30], [280, 26], [300, 22],
  ];
  const path = "M " + points.map(p => p.join(" ")).join(" L ");
  const fillPath = path + ` L 300 150 L 16 150 Z`;
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
      {/* horizontal rules */}
      {[40, 70, 100, 130].map((y, i) => (
        <line key={i} x1="16" y1={y} x2="304" y2={y} stroke="currentColor" strokeOpacity="0.08"/>
      ))}
      <path d={fillPath} fill="var(--accent)" fillOpacity="0.1"/>
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
      {points.map((p, i) => (
        i % 3 === 0 && <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="var(--accent)"/>
      ))}
      <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.6">
        <text x="16" y="22">TVL · 2021 → 2024</text>
        <text x="304" y="22" textAnchor="end">$5M · $1B/mo vol</text>
        <text x="16" y="170">monthly volume — log scale</text>
      </g>
      {/* arrow up */}
      <text x="296" y="38" textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">↗</text>
    </svg>
  );
}

function ThumbNotes() {
  // Editorial: stacked rules like a printed page
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
      <g>
        <rect x="60" y="20" width="200" height="140" fill="var(--paper)" stroke="currentColor" strokeOpacity="0.4"/>
        {/* header rule */}
        <line x1="76" y1="40" x2="180" y2="40" stroke="var(--accent)" strokeWidth="2"/>
        {/* body lines */}
        {Array.from({length: 9}).map((_, i) => {
          const y = 60 + i * 11;
          const w = [180, 168, 184, 150, 174, 160, 180, 100, 0][i];
          if (!w) return null;
          return <line key={i} x1="76" y1={y} x2={76 + w - 76} y2={y}
            stroke="currentColor" strokeOpacity="0.45" strokeWidth="1"/>;
        })}
        <text x="76" y="34" fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55">essay no. 24</text>
        <text x="244" y="34" fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55" textAnchor="end">12 min</text>
      </g>
      <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55">
        <text x="16" y="22">/notes/2026/04/</text>
      </g>
    </svg>
  );
}

function ThumbStackOverflow() {
  // SO: vote arrows + accepted tick + tag chips
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
      {/* vote column */}
      <g stroke="currentColor" fill="none">
        <path d="M 36 50 L 46 38 L 56 50" strokeWidth="1.5" opacity="0.7"/>
        <text x="46" y="78" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="20" fill="currentColor">42</text>
        <path d="M 36 100 L 46 112 L 56 100" strokeWidth="1.5" opacity="0.4"/>
        {/* accepted tick */}
        <path d="M 30 130 L 42 142 L 60 122" stroke="var(--accent)" strokeWidth="2.5"/>
      </g>
      {/* answer body */}
      <g>
        {[60, 74, 88, 102, 116].map((y, i) => (
          <line key={i} x1="90" y1={y} x2={90 + [180, 200, 160, 190, 100][i]} y2={y}
            stroke="currentColor" strokeOpacity="0.35" strokeWidth="1"/>
        ))}
        {/* tag chips */}
        <g fontFamily="var(--font-mono)" fontSize="9">
          <rect x="90" y="135" width="38" height="16" fill="none" stroke="currentColor" strokeOpacity="0.5"/>
          <text x="109" y="147" textAnchor="middle" fill="currentColor" opacity="0.7">java</text>
          <rect x="134" y="135" width="58" height="16" fill="none" stroke="currentColor" strokeOpacity="0.5"/>
          <text x="163" y="147" textAnchor="middle" fill="currentColor" opacity="0.7">javascript</text>
          <rect x="198" y="135" width="48" height="16" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)"/>
          <text x="222" y="147" textAnchor="middle" fill="var(--accent)">parsers</text>
        </g>
      </g>
      <g fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.55">
        <text x="16" y="22">stackoverflow.com/u/zozol</text>
        <text x="304" y="22" textAnchor="end">7k+ rep</text>
      </g>
    </svg>
  );
}

const THUMBS = {
  "masala-parser": ThumbMasala,
  "swaap-monorepo": ThumbSwaap,
  "robusta/notes": ThumbNotes,
  "stack-overflow": ThumbStackOverflow,
};

window.THUMBS = THUMBS;
