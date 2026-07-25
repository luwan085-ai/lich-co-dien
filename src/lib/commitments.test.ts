import { describe, expect, it, vi } from 'vitest';
import {
  countStreakEndingAt,
  loadCommitment,
  pickPraiseForCompletion,
  saveCommitment,
} from './commitments';

const store: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: (key: string) => Promise.resolve(store[key] ?? null),
    setItem: (key: string, val: string) => {
      store[key] = val;
      return Promise.resolve();
    },
  },
}));

describe('commitments', () => {
  it('saves and loads a commitment entry', async () => {
    const dateKey = '2026-07-25';
    await saveCommitment(dateKey, {
      text: 'Chúc gia đình luôn bình an hạnh phúc',
      completedAt: '2026-07-25T16:36:00.000Z',
      praiseId: 'lam_tot_lam',
    });

    const loaded = await loadCommitment(dateKey);
    expect(loaded).not.toBeNull();
    expect(loaded?.text).toBe('Chúc gia đình luôn bình an hạnh phúc');
    expect(loaded?.praiseId).toBe('lam_tot_lam');
  });

  it('calculates streak correctly', async () => {
    const today = { year: 2026, month: 7, day: 25 };
    const streak = await countStreakEndingAt(today);
    expect(streak).toBeGreaterThanOrEqual(1);
  });

  it('picks appropriate praise stamp for early morning or streak', () => {
    const morningDate = new Date('2026-07-25T08:00:00Z');
    const praise = pickPraiseForCompletion({
      now: morningDate,
      streakAfter: 3,
    });
    expect(praise).toBe('gioi_lam');
  });
});
