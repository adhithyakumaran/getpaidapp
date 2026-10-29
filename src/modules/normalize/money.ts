export function decimalRupeesToPaise(token: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(token)) throw new Error("Invalid money token");
  const [whole, fraction = ""] = token.split(".");
  const paise = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (paise > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Money out of range");
  return Number(paise);
}

// pg intentionally returns BIGINT as text; never install a global lossy parser.
export function paiseFromDatabase(value: string | null): number | null {
  if (value === null) return null;
  if (!/^\d+$/.test(value) || BigInt(value) > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Invalid database money");
  return Number(value);
}
