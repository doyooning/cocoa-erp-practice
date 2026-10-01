// 시드 고정 난수 — 실습할 때마다 같은 데이터가 나오도록 한다.
export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function int(rng: () => number, min: number, max: number) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

export function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function phone(rng: () => number) {
  return `010-${pad(int(rng, 0, 9999), 4)}-${pad(int(rng, 0, 9999), 4)}`;
}
