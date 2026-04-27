// Tiny editorial figures, one per post — abstract technical glyphs

function FigQueue() {
  return (
    <svg viewBox="0 0 88 56">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        {[10, 22, 34, 46, 58, 70].map((x, i) => (
          <rect key={i} x={x} y={20} width="10" height="16"
            opacity={i < 3 ? 1 : 0.3}
            fill={i === 0 ? "var(--accent)" : "none"}/>
        ))}
        <path d="M 4 28 L 8 28 M 80 28 L 84 28" strokeOpacity="0.5"/>
        <path d="M 80 28 L 76 25 M 80 28 L 76 31" strokeOpacity="0.5"/>
      </g>
    </svg>
  );
}

function FigDAG() {
  return (
    <svg viewBox="0 0 88 56">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <line x1="14" y1="28" x2="34" y2="14" opacity="0.5"/>
        <line x1="14" y1="28" x2="34" y2="42" opacity="0.5"/>
        <line x1="34" y1="14" x2="54" y2="28" opacity="0.5"/>
        <line x1="34" y1="42" x2="54" y2="28" opacity="0.5"/>
        <line x1="54" y1="28" x2="74" y2="28" stroke="var(--accent)"/>
        <circle cx="14" cy="28" r="4" fill="var(--paper)"/>
        <circle cx="34" cy="14" r="4" fill="var(--paper)"/>
        <circle cx="34" cy="42" r="4" fill="var(--paper)"/>
        <circle cx="54" cy="28" r="4" fill="var(--paper)"/>
        <circle cx="74" cy="28" r="4" fill="var(--accent)" stroke="var(--accent)"/>
      </g>
    </svg>
  );
}

function FigSampling() {
  return (
    <svg viewBox="0 0 88 56">
      <g stroke="currentColor" strokeWidth="1">
        <path d="M 8 40 Q 22 10, 36 30 T 64 26 T 84 18" fill="none" opacity="0.4"/>
        {[
          [12, 36], [22, 18], [30, 28], [38, 26], [44, 30],
          [52, 24], [60, 28], [68, 22], [76, 24]
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.5 : 1.4}
            fill={i % 3 === 0 ? "var(--accent)" : "currentColor"}
            opacity={i % 3 === 0 ? 1 : 0.45}/>
        ))}
      </g>
    </svg>
  );
}

function FigReadme() {
  return (
    <svg viewBox="0 0 88 56">
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <rect x="18" y="8" width="52" height="40" opacity="0.6"/>
        <line x1="24" y1="16" x2="44" y2="16" stroke="var(--accent)" strokeWidth="2"/>
        <line x1="24" y1="22" x2="62" y2="22" opacity="0.5"/>
        <line x1="24" y1="28" x2="58" y2="28" opacity="0.5"/>
        <line x1="24" y1="34" x2="62" y2="34" opacity="0.5"/>
        <line x1="24" y1="40" x2="50" y2="40" opacity="0.5"/>
      </g>
    </svg>
  );
}

const POST_FIGS = [FigQueue, FigDAG, FigSampling, FigReadme];
window.POST_FIGS = POST_FIGS;
