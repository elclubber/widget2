// FootballIcon.jsx
export default function FootballIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* sphere shading */}
        <radialGradient id="ballShade" cx="30%" cy="28%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.6" stopColor="#f2f6f8" />
          <stop offset="1" stopColor="#d7e0e6" />
        </radialGradient>

        {/* edge vignette */}
        <radialGradient id="rim" cx="50%" cy="50%" r="56%">
          <stop offset="86%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </radialGradient>

        {/* specular hotspot */}
        <radialGradient id="gloss" cx="28%" cy="22%" r="28%">
          <stop offset="0" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* pentagon shape (unit, pointing up) */}
        <symbol id="pent">
          <path d="M0,-10 L9.51,-3.09 L5.88,8.09 L-5.88,8.09 L-9.51,-3.09 Z" />
        </symbol>
      </defs>

      {/* sphere */}
      <g clipPath="url(#cut)">
        <circle cx="50" cy="50" r="46" fill="url(#ballShade)" />
        <circle cx="50" cy="50" r="46" fill="url(#rim)" />
        <circle cx="50" cy="50" r="46" fill="url(#gloss)" />
      </g>
      <clipPath id="cut">
        <circle cx="50" cy="50" r="46" />
      </clipPath>

      {/* seams (light grey) */}
      <g stroke="#e6edf0" strokeWidth="1.3" strokeLinejoin="round" fill="none" opacity="0.9">
        {/* ring seams roughly forming hexes around the center */}
        <path d="M50 40 L38 45 L40 58 L50 64 L60 58 L62 45 Z" />
        <path d="M38 45 L30 40 L28 50 L35 60 L40 58" />
        <path d="M62 45 L70 40 L72 50 L65 60 L60 58" />
        <path d="M40 58 L35 70 L50 74 L65 70 L60 58" />
      </g>

      {/* black pentagon patches (only pentagons are black on classic balls) */}
      <g fill="#111" stroke="#0b0b0b" strokeWidth="0.6">
        {/* center */}
        <use href="#pent" transform="translate(50,50) scale(1.18)" />
        {/* ring of five */}
        <use href="#pent" transform="translate(50,28) scale(1.82)" />
        <use href="#pent" transform="translate(30,40) rotate(30) scale(1.78)" />
        <use href="#pent" transform="translate(70,40) rotate(12) scale(1.78)" />
        <use href="#pent" transform="translate(36,70) rotate(14) scale(1.78)" />
        <use href="#pent" transform="translate(64,70) rotate(-14) scale(1.78)" />
      </g>

      {/* tiny highlight to sell the 3D look */}
      <circle cx="57" cy="43" r="5.5" fill="url(#gloss)" />
    </svg>
  );
}
