export const rand = (n: number) => Math.floor(Math.random() * n);
export const pick = <T,>(a: readonly T[]): T => a[rand(a.length)];
export function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = rand(i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
