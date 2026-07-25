import { describe, expect, it } from 'vitest';
import { findGoodDaysForPurpose, PURPOSE_LIST } from './goodDays';

describe('goodDays', () => {
  it('has valid purpose metadata', () => {
    expect(PURPOSE_LIST.length).toBe(5);
    expect(PURPOSE_LIST[0]?.id).toBe('khai_truong');
  });

  it('finds recommended good days for khai_truong', () => {
    const from = { year: 2026, month: 7, day: 25 };
    const list = findGoodDaysForPurpose('khai_truong', from, 3);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(3);
    expect(list[0]?.hoangDaoName).toBeTruthy();
    expect(list[0]?.matchedReason).toContain('Hoàng Đạo');
  });

  it('finds recommended good days for nhap_trach', () => {
    const from = { year: 2026, month: 7, day: 25 };
    const list = findGoodDaysForPurpose('nhap_trach', from, 2);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]?.daysUntil).toBeGreaterThanOrEqual(0);
  });
});
