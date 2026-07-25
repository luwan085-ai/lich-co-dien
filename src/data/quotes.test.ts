import { describe, expect, it } from 'vitest';
import { DAILY_QUOTES_365, getDayOfYear, quoteForDate } from './quotes';

describe('365 Quotes Database', () => {
  it('contains exactly 365 daily quotes', () => {
    expect(DAILY_QUOTES_365.length).toBe(365);
  });

  it('calculates correct day of year', () => {
    expect(getDayOfYear(2026, 1, 1)).toBe(1);
    expect(getDayOfYear(2026, 12, 31)).toBe(365);
  });

  it('returns valid quote for any day of year', () => {
    const qJan1 = quoteForDate(2026, 1, 1);
    expect(qJan1.text).toBeTruthy();
    expect(qJan1.author).toBeTruthy();

    const qDec31 = quoteForDate(2026, 12, 31);
    expect(qDec31.text).toBeTruthy();
    expect(qDec31.author).toBeTruthy();
  });
});
