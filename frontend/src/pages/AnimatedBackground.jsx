/**
 * AnimatedBackground.jsx
 * Fixed-position layered gradient blobs that drift slowly behind all content.
 * Gold/amber palette to match Career Intel's dark editorial aesthetic.
 * Zero JS animation — pure CSS keyframes, no layout reflow.
 */
export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      {/* Primary gold beacon — top-left anchor */}
      <div className="glow glow1" />
      {/* Warm amber bloom — bottom-right */}
      <div className="glow glow2" />
      {/* Deep slate mid-fill — centre */}
      <div className="glow glow3" />
      {/* Faint secondary gold — top-right */}
      <div className="glow glow4" />
      {/* Thin horizontal light streak */}
      <div className="glow glow5" />
    </div>
  );
}
