export function num(value: number | null | undefined, digits = 2): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const fixed = value.toFixed(digits);
  return fixed === "-0" || /^-0\.0+$/.test(fixed) ? fixed.slice(1) : fixed;
}

export function sci(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  return value.toExponential(digits);
}

export function stamp(value: string): string {
  if (!value) return "—";
  return value.replace("T", " ").slice(0, 19);
}
