// Light inline-SVG ring shown in the hero on phones instead of the 3D scene.
// No WebGL, no extra JavaScript download; the only motion is a soft sparkle (opacity/transform).
const STAR = "M0 -9 C1 -3 3 -1 9 0 C3 1 1 3 0 9 C-1 3 -3 1 -9 0 C-3 -1 -1 -3 0 -9 Z";

export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 320 240" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="ha-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#F1DFB6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F1DFB6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ha-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#B8924A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#B8924A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ha-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EBD7A6" />
          <stop offset="0.42" stopColor="#B8924A" />
          <stop offset="0.7" stopColor="#E8D098" />
          <stop offset="1" stopColor="#A9823A" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="124" r="122" fill="url(#ha-glow)" />
      <ellipse cx="160" cy="220" rx="78" ry="8" fill="url(#ha-shadow)" />

      {/* band */}
      <circle cx="160" cy="148" r="64" fill="none" stroke="url(#ha-band)" strokeWidth="10" />
      <circle cx="160" cy="148" r="59.5" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="120 280" strokeDashoffset="-40" />

      {/* gem */}
      <g stroke="#B8924A" strokeWidth="1" strokeLinejoin="round">
        <polygon points="140,24 118,46 152,46" fill="#F4E7CB" />
        <polygon points="140,24 180,24 168,46 152,46" fill="#FFFFFF" />
        <polygon points="180,24 202,46 168,46" fill="#EBD6A6" />
        <polygon points="118,46 152,46 160,84" fill="#E4C98C" />
        <polygon points="152,46 168,46 160,84" fill="#F8EFD9" />
        <polygon points="168,46 202,46 160,84" fill="#D8B66F" />
      </g>

      {/* sparkles */}
      <g transform="translate(104 30)"><path className="ha-star" d={STAR} fill="#D4B16A" /></g>
      <g transform="translate(218 34) scale(0.8)"><path className="ha-star" d={STAR} fill="#D4B16A" /></g>
      <g transform="translate(244 132) scale(0.65)"><path className="ha-star" d={STAR} fill="#D4B16A" /></g>
    </svg>
  );
}
