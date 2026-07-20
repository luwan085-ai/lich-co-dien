import { describe, expect, it } from 'vitest';
import {
  canAddAnniversary,
  clampAdvanceForTier,
  countUniqueAnniversaries,
  FREE_ANNIV_LIMIT,
  isAdvanceAllowed,
} from './gioLimits';

describe('gioLimits', () => {
  const mapWithFive = Object.fromEntries(
    Array.from({ length: FREE_ANNIV_LIMIT }, (_, i) => [
      `2024-0${i + 1}-01`,
      {
        text: `Giỗ ${i}`,
        isAnniversary: true,
        annivKind: 'gio' as const,
        lunar: { month: i + 1, day: 1, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ]),
  );

  it('counts unique lunar anniversaries', () => {
    expect(countUniqueAnniversaries(mapWithFive)).toBe(FREE_ANNIV_LIMIT);
  });

  it('blocks new anniversary when free limit reached', () => {
    const gate = canAddAnniversary(mapWithFive, '2024-12-01', true, false);
    expect(gate.ok).toBe(false);
  });

  it('allows premium beyond limit', () => {
    const gate = canAddAnniversary(mapWithFive, '2024-12-01', true, true);
    expect(gate.ok).toBe(true);
  });

  it('allows editing existing anniversary on same day', () => {
    const gate = canAddAnniversary(mapWithFive, '2024-01-01', true, false);
    expect(gate.ok).toBe(true);
  });

  it('gates advance days for free tier', () => {
    expect(isAdvanceAllowed(1, false)).toBe(true);
    expect(isAdvanceAllowed(3, false)).toBe(false);
    expect(isAdvanceAllowed(7, true)).toBe(true);
  });

  it('clamps stored advance for free tier', () => {
    expect(clampAdvanceForTier(7, false)).toBe(1);
    expect(clampAdvanceForTier(3, true)).toBe(3);
  });
});
