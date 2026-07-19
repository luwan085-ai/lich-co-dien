import { parseCanChi, type Branch } from '../data/canChiMeta';
import type { CalendarDay } from '../lunar/today';

/** Classic branch → favorable travel bearing (VN folk calendar shorthand). */
const BRANCH_BEARING: Record<Branch, string> = {
  Tý: 'Bắc',
  Sửu: 'Đông Bắc',
  Dần: 'Đông Bắc',
  Mão: 'Đông',
  Thìn: 'Đông Nam',
  Tỵ: 'Đông Nam',
  Ngọ: 'Nam',
  Mùi: 'Tây Nam',
  Thân: 'Tây Nam',
  Dậu: 'Tây',
  Tuất: 'Tây Bắc',
  Hợi: 'Tây Bắc',
};

const OPPOSITE: Record<Branch, Branch> = {
  Tý: 'Ngọ',
  Sửu: 'Mùi',
  Dần: 'Thân',
  Mão: 'Dậu',
  Thìn: 'Tuất',
  Tỵ: 'Hợi',
  Ngọ: 'Tý',
  Mùi: 'Sửu',
  Thân: 'Dần',
  Dậu: 'Mão',
  Tuất: 'Thìn',
  Hợi: 'Tỵ',
};

export type TravelHint = {
  favorable: string;
  avoid: string;
  line: string;
};

/** Compact hướng xuất hành for home pulse card. */
export function travelHintForDay(day: CalendarDay): TravelHint {
  const parsed = parseCanChi(day.canChi.day);
  const branch = parsed?.branch;
  if (!branch) {
    return {
      favorable: 'Đông · Nam',
      avoid: 'Tây',
      line: 'Hướng xuất hành · Đông, Nam',
    };
  }
  const favorable = BRANCH_BEARING[branch];
  const avoid = BRANCH_BEARING[OPPOSITE[branch]];
  return {
    favorable,
    avoid,
    line: `Hướng xuất hành · ${favorable}${day.isGoodDay ? '' : ` · tránh ${avoid}`}`,
  };
}
