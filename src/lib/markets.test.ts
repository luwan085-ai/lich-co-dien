import { describe, expect, it } from 'vitest';
import { formatMarketFallbackAsOf, MARKET_FALLBACK_AS_OF } from './markets';

describe('markets fallback labels', () => {
  it('formats baseline date for offline quotes', () => {
    expect(formatMarketFallbackAsOf()).toBe(
      `${MARKET_FALLBACK_AS_OF.day}/${MARKET_FALLBACK_AS_OF.month}/${MARKET_FALLBACK_AS_OF.year}`,
    );
  });
});
