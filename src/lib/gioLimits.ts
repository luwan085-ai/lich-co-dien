import type { DayMemo } from './localMemos';
import { hydrateMemo } from './localMemos';
import { listUniqueGio, type GioAdvanceDays } from './gioSchedule';

/** Free tier cap — Premium removes limit. */
export const FREE_ANNIV_LIMIT = 5;

export function countUniqueAnniversaries(map: Record<string, DayMemo>): number {
  return listUniqueGio(map).length;
}

export function canAddAnniversary(
  map: Record<string, DayMemo>,
  dateKey: string,
  turningOn: boolean,
  isPremium: boolean,
): { ok: true } | { ok: false; message: string } {
  if (!turningOn || isPremium) return { ok: true };
  const existing = map[dateKey]
    ? hydrateMemo(dateKey, map[dateKey]!)
    : null;
  if (existing?.isAnniversary) return { ok: true };
  if (countUniqueAnniversaries(map) >= FREE_ANNIV_LIMIT) {
    return {
      ok: false,
      message: `Miễn phí tối đa ${FREE_ANNIV_LIMIT} giỗ/sinh nhật âm. Nâng cấp Premium để thêm không giới hạn.`,
    };
  }
  return { ok: true };
}

export function isAdvanceAllowed(
  days: GioAdvanceDays,
  isPremium: boolean,
): boolean {
  if (isPremium) return true;
  return days === 0 || days === 1;
}

export function clampAdvanceForTier(
  days: GioAdvanceDays,
  isPremium: boolean,
): GioAdvanceDays {
  if (isPremium) return days;
  if (days === 3 || days === 7) return 1;
  return days;
}
