// BrandLogo.jsx — 💪 🏗 + hand-drawn "Robusta Build" wordmark image.
// size: 'compact' (nav), 'full' (with tagline), 'mark' (just the icons)
//
// The wordmark is a scanned napkin sketch (assets/robusta-build-wordmark.png),
// 1603×312 with white knocked out and the blue marker underline baked in.
// We size it by height and let width scale; the height is tuned to sit a touch
// taller than the cap-height of the emoji so the marks read as one lockup.
// Path is resolved relative to the HOST HTML page, not this JSX file. Each
// host page sets `window.ROBUSTA_WORDMARK_SRC` before loading this script;
// fallback assumes the page lives one level deep (e.g. preview/*.html).
const ROBUSTA_WORDMARK_SRC = window.ROBUSTA_WORDMARK_SRC || '../assets/robusta-build-wordmark.png';
const ROBUSTA_WORDMARK_RATIO = 1603 / 312; // ≈ 5.14

function BrandLogo({ size = 'compact', style = {} }) {
  const emojiStyle = (h) => ({
    fontSize: h, lineHeight: 1,
    fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"
  });

  if (size === 'mark') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, ...style }}>
        <span style={emojiStyle(56)}>💪</span>
        <span style={emojiStyle(56)}>🏗</span>
      </span>
    );
  }

  // Heights tuned so the wordmark optically matches the emoji cap-height.
  // Wordmark image includes the underline + descenders, so it's ~1.4× cap height.
  const emojiH = size === 'full' ? 56 : 36;
  const wordmarkH = size === 'full' ? 76 : 50;
  const wordmarkW = wordmarkH * ROBUSTA_WORDMARK_RATIO;
  const gap = size === 'full' ? 16 : 10;

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
        <span style={emojiStyle(emojiH)}>💪</span>
        <span style={emojiStyle(emojiH)}>🏗</span>
        <img
          src={ROBUSTA_WORDMARK_SRC}
          alt="Robusta Build"
          width={wordmarkW}
          height={wordmarkH}
          style={{
            display: 'block',
            // Nudge up slightly so the wordmark's optical baseline aligns with emoji.
            marginTop: size === 'full' ? -4 : -3,
            marginLeft: size === 'full' ? 4 : 2,
            // Crisp scaling for the inked stroke.
            imageRendering: 'auto'
          }}
        />
      </span>
      {size === 'full' && (
        <span style={{
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif", fontSize: 14, color: '#6b6b66',
          marginTop: 10, marginLeft: emojiH * 2 + gap * 2
        }}>senior engineering, hand-built.</span>
      )}
    </span>
  );
}
window.BrandLogo = BrandLogo;
