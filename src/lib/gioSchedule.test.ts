import { describe, expect, it } from 'vitest';
import {
  advanceSolarFor,
  daysBetween,
  dDayLabel,
  formatLunarLabel,
  formatSolarShort,
  listUniqueGio,
  listUpcomingGio,
  nextOccurrence,
} from './gioSchedule';
import type { DayMemo } from './localMemos';

describe('daysBetween', () => {
  it('counts calendar-day difference', () => {
    expect(
      daysBetween(
        { year: 2026, month: 7, day: 19 },
        { year: 2026, month: 7, day: 21 },
      ),
    ).toBe(2);
  });

  it('returns 0 for the same day', () => {
    expect(
      daysBetween(
        { year: 2026, month: 1, day: 1 },
        { year: 2026, month: 1, day: 1 },
      ),
    ).toBe(0);
  });
});

describe('dDayLabel', () => {
  it('formats Vietnamese countdown labels', () => {
    expect(dDayLabel(0)).toBe('Hôm nay');
    expect(dDayLabel(1)).toBe('Ngày mai');
    expect(dDayLabel(12)).toBe('Còn 12 ngày');
  });
});

describe('formatSolarShort', () => {
  it('zero-pads day and month', () => {
    expect(formatSolarShort({ year: 2026, month: 3, day: 5 })).toBe(
      '05/03/2026',
    );
  });
});

describe('formatLunarLabel', () => {
  it('includes leap suffix when needed', () => {
    expect(
      formatLunarLabel({ month: 4, day: 15, leapMonth: true }),
    ).toBe('âm 15/4 nhuận');
  });
});

describe('nextOccurrence', () => {
  it('finds the next solar date on or after `from`', () => {
    const lunar = { month: 1, day: 1, leapMonth: false };
    const from = { year: 2026, month: 1, day: 20 };
    const next = nextOccurrence(lunar, from);
    expect(next).not.toBeNull();
    expect(next!.daysUntil).toBeGreaterThanOrEqual(0);
    expect(next!.solar.year).toBeGreaterThanOrEqual(2026);
  });
});

describe('listUniqueGio', () => {
  it('dedupes lunar anniversaries and preserves annivKind', () => {
    const lunar = { month: 3, day: 10, leapMonth: false };
    const map: Record<string, DayMemo> = {
      '2024-03-10': {
        text: 'Bà nội',
        isAnniversary: true,
        annivKind: 'gio',
        lunar,
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      '2025-03-10': {
        text: 'Bà nội duplicate',
        isAnniversary: true,
        annivKind: 'gio',
        lunar,
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    };

    const items = listUniqueGio(map);
    expect(items).toHaveLength(1);
    expect(items[0]?.annivKind).toBe('gio');
    expect(items[0]?.label).toBe('Bà nội');
  });

  it('defaults birthday label when text is empty', () => {
    const map: Record<string, DayMemo> = {
      '2024-05-01': {
        text: '',
        isAnniversary: true,
        annivKind: 'birthday',
        lunar: { month: 5, day: 1, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };

    const items = listUniqueGio(map);
    expect(items[0]?.label).toBe('Sinh nhật âm');
    expect(items[0]?.annivKind).toBe('birthday');
  });
});

describe('listUpcomingGio', () => {
  it('sorts by daysUntil ascending', () => {
    const from = { year: 2026, month: 7, day: 19 };
    const map: Record<string, DayMemo> = {
      '2024-12-01': {
        text: 'Giỗ A',
        isAnniversary: true,
        annivKind: 'gio',
        lunar: { month: 12, day: 1, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      '2024-08-15': {
        text: 'Giỗ B',
        isAnniversary: true,
        annivKind: 'gio',
        lunar: { month: 8, day: 15, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };

    const upcoming = listUpcomingGio(map, from, 10);
    expect(upcoming.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < upcoming.length; i += 1) {
      expect(upcoming[i]!.daysUntil).toBeGreaterThanOrEqual(
        upcoming[i - 1]!.daysUntil,
      );
    }
  });
});

describe('advanceSolarFor', () => {
  it('returns null when advance is zero', () => {
    expect(
      advanceSolarFor({ year: 2026, month: 7, day: 19 }, 0),
    ).toBeNull();
  });

  it('steps back N solar days', () => {
    expect(
      advanceSolarFor({ year: 2026, month: 7, day: 19 }, 3),
    ).toEqual({ year: 2026, month: 7, day: 16 });
  });
});
