import { describe, expect, it } from 'vitest';
import { hydrateMemo, inferAnnivKind, annivKindOnLunar } from './localMemos';

describe('inferAnnivKind', () => {
  it('detects lunar birthday phrases', () => {
    expect(inferAnnivKind('Sinh nhật bà nội')).toBe('birthday');
    expect(inferAnnivKind('SN âm')).toBe('birthday');
    expect(inferAnnivKind('mừng tuổi ông')).toBe('birthday');
  });

  it('defaults to giỗ when no birthday hint', () => {
    expect(inferAnnivKind('Giỗ bà nội')).toBe('gio');
    expect(inferAnnivKind('')).toBe('gio');
    expect(inferAnnivKind('   ')).toBe('gio');
  });
});

describe('hydrateMemo', () => {
  it('backfills annivKind for legacy anniversary memos', () => {
    const memo = hydrateMemo('2024-05-01', {
      text: 'Sinh nhật con',
      isAnniversary: true,
      updatedAt: '2024-01-01T00:00:00.000Z',
      lunar: { month: 5, day: 1, leapMonth: false },
    });
    expect(memo.annivKind).toBe('birthday');
  });

  it('preserves explicit annivKind', () => {
    const memo = hydrateMemo('2024-05-01', {
      text: 'Bà nội',
      isAnniversary: true,
      annivKind: 'gio',
      updatedAt: '2024-01-01T00:00:00.000Z',
      lunar: { month: 5, day: 1, leapMonth: false },
    });
    expect(memo.annivKind).toBe('gio');
  });

  it('does not infer kind for plain notes', () => {
    const memo = hydrateMemo('2024-05-01', {
      text: 'Đi chợ sáng',
      isAnniversary: false,
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    expect(memo.annivKind).toBeUndefined();
  });
});

describe('annivKindOnLunar', () => {
  it('returns kind for matching lunar anniversary', () => {
    const map = {
      '2024-08-15': {
        text: 'Bà nội',
        isAnniversary: true,
        annivKind: 'gio' as const,
        lunar: { month: 7, day: 12, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    expect(
      annivKindOnLunar(map, { month: 7, day: 12, leapMonth: false }),
    ).toBe('gio');
  });

  it('prefers explicit birthday kind', () => {
    const map = {
      '2024-05-01': {
        text: 'Con trai',
        isAnniversary: true,
        annivKind: 'birthday' as const,
        lunar: { month: 5, day: 1, leapMonth: false },
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    expect(
      annivKindOnLunar(map, { month: 5, day: 1, leapMonth: false }),
    ).toBe('birthday');
  });
});
