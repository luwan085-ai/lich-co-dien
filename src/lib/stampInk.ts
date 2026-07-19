/** Dark Indian red with a muted violet undertone — mực dấu cổ điển. */
export const INK_RED = '#7A2C38';
export const INK_RED_DEEP = '#5E2230';
export const INK_RED_SOFT = '#8F3A48';

export type InkBlotch = {
  left: `${number}%`;
  top: `${number}%`;
  width: number;
  height: number;
  opacity: number;
  rotate: number;
};

export type InkMiss = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
};

export type InkVariance = {
  /** Overall ink wetness */
  opacity: number;
  /** Extra tilt when pressing */
  tiltJitter: number;
  /** Soft bleeds on the rim */
  blotches: InkBlotch[];
  /** White gaps where rubber didn’t take ink */
  misses: InkMiss[];
  /** Outer border alpha 0–1 */
  rimAlpha: number;
  /** Inner fill wash */
  washOpacity: number;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fresh seed each press — different bleed every day you stamp. */
export function freshInkSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
}

export function buildInkVariance(seed: number): InkVariance {
  const r = mulberry32(seed || 1);
  const blotches: InkBlotch[] = Array.from({ length: 5 + Math.floor(r() * 3) }, () => ({
    left: `${4 + r() * 86}%` as `${number}%`,
    top: `${4 + r() * 86}%` as `${number}%`,
    width: 5 + r() * 16,
    height: 3 + r() * 10,
    opacity: 0.06 + r() * 0.14,
    rotate: r() * 160 - 80,
  }));
  const misses: InkMiss[] = Array.from({ length: 3 + Math.floor(r() * 3) }, () => ({
    left: `${8 + r() * 78}%` as `${number}%`,
    top: `${8 + r() * 78}%` as `${number}%`,
    size: 2 + r() * 5,
  }));
  return {
    opacity: 0.78 + r() * 0.2,
    tiltJitter: r() * 6 - 3,
    blotches,
    misses,
    rimAlpha: 0.72 + r() * 0.28,
    washOpacity: 0.04 + r() * 0.06,
  };
}

/** Premium gold ink for stamp skins. */
export const INK_GOLD = '#C9A84C';

export type StampSkinTone = 'classic' | 'gold' | 'tape';

export function stampInkForSkin(skin: StampSkinTone): string {
  return skin === 'gold' ? INK_GOLD : INK_RED;
}

