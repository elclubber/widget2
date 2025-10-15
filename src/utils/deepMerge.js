// overlay/utils/deepMerge.js
export function deepMerge(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(override)) {
    const bv = base?.[k];
    const ov = override[k];
    if (bv && typeof bv === "object" && !Array.isArray(bv) &&
        typeof ov === "object" && !Array.isArray(ov)) {
      out[k] = deepMerge(bv, ov);
    } else {
      out[k] = ov;
    }
  }
  return out;
}
