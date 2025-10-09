import "./widget.css";

export default function OddsStrip({ items = [], maxWidth = 720, bleed = 72 }) {
  return (
    <div
      className="odds-strip"
      style={{
        "--pitch-max": `${maxWidth}px`,
        "--pitch-bleed": `${bleed}px`,
      }}
    >
      <div className="odds-row">
        {items.map((it, idx) => (
          <button key={idx + it.label} type="button" className="odds-chip">
              <span className="label">{it.label}</span>
              <span className="odds">{it.odds}</span>
            <span className="sub">{it.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
