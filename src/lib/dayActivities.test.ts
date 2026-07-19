import { describe, expect, it } from 'vitest';
import {
  activitiesConflict,
  resolveDayActivities,
} from './dayActivities';

describe('activitiesConflict', () => {
  it('detects identical and token overlap', () => {
    expect(activitiesConflict('khai trương', 'khai trương')).toBe(true);
    expect(activitiesConflict('khai trương, xuất hành', 'khai trương')).toBe(
      true,
    );
  });

  it('allows unrelated acts', () => {
    expect(activitiesConflict('cúng bái', 'cưới hỏi')).toBe(false);
  });
});

describe('resolveDayActivities', () => {
  it('removes Nên items that also appear in Kiêng', () => {
    const { shouldDo, avoidDo } = resolveDayActivities(
      ['khai trương', 'xuất hành'],
      ['cưới hỏi', 'khai trương'],
      'bad',
    );
    expect(avoidDo).toContain('khai trương');
    expect(shouldDo.some((s) => activitiesConflict(s, 'khai trương'))).toBe(
      false,
    );
    expect(shouldDo.some((s) => activitiesConflict(s, 'cưới hỏi'))).toBe(
      false,
    );
  });

  it('uses conservative Nên on Hắc Đạo when raw list is aggressive', () => {
    const { shouldDo } = resolveDayActivities(
      ['khai trương', 'xuất hành'],
      ['cưới hỏi', 'khai trương'],
      'bad',
    );
    expect(shouldDo.length).toBeGreaterThan(0);
    expect(shouldDo.every((s) => !activitiesConflict(s, 'khai trương'))).toBe(
      true,
    );
    expect(
      shouldDo.some((s) =>
        /việc nhỏ|chuẩn bị|cúng bái|dọn dẹp|sắp xếp/i.test(s),
      ),
    ).toBe(true);
  });

  it('keeps library Nên on good Hoàng Đạo after dedupe only', () => {
    const { shouldDo } = resolveDayActivities(
      ['khai trương', 'xuất hành'],
      ['cưới hỏi'],
      'good',
    );
    expect(shouldDo).toContain('khai trương');
    expect(shouldDo).toContain('xuất hành');
    expect(shouldDo.some((s) => activitiesConflict(s, 'cưới hỏi'))).toBe(
      false,
    );
  });
});
