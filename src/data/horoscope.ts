import type { CalendarDay } from '../lunar/today';
import {
  ELEMENT_TRAIT,
  parseCanChi,
  type ElementVi,
} from './canChiMeta';
import { ZODIAC_PACK, zodiacPackKey } from './zodiacPack';

const OVERALL_BY_TONE: Record<
  CalendarDay['dayPathTone'],
  string[]
> = {
  great: [
    'Đại cát — thuận mở việc lớn nếu giữ nhịp thanh thản',
    'Ngày sáng — hợp xuất hành và gặp người quan trọng',
    'Khí rất đẹp — chốt việc đã chuẩn bị sẵn sẽ trôi',
    'Hôm nay dễ “mở hàng” nếu chào hỏi chân thành',
    'Nên tiến — nhưng nhớ cảm ơn người hỗ trợ',
  ],
  good: [
    'Cát — làm chắc việc chính sẽ thấy tiến rõ',
    'Khí tốt — hợp trao đổi và hoàn tất dở dang',
    'Thuận trung bình khá — ưu tiên một mục tiêu',
    'Ngày hợp ký nhỏ, tránh ký quá lớn vội',
    'Làm ít việc nhưng dứt điểm sẽ lời hơn',
  ],
  neutral: [
    'Bình — giữ nhịp đều còn hơn cố đốt giai đoạn',
    'Ngày ổn — chăm gốc rễ trước khi mở rộng',
    'Không nóng không lạnh — kỷ luật thắng cảm xúc',
    'Làm việc nhàm sẽ bảo vệ tài lộc hôm nay',
    'Tránh FOMO — kế hoạch cũ vẫn đủ tốt',
  ],
  poor: [
    'Nên tĩnh — giảm việc mới, ưu tiên nghỉ và sắp xếp',
    'Khí trầm — làm ít nhưng chất lượng',
    'Tránh tranh cãi tiền bạc buổi tối',
    'Bảo vệ sức khỏe trước — việc sẽ chờ',
    'Đừng cứu cả thế giới hôm nay — cứu lịch của bạn',
  ],
  bad: [
    'Thận trọng — tránh quyết định lớn và tranh cãi',
    'Ngày nặng — bảo vệ sức khỏe và quỹ tiền trước',
    'Ký giấy tờ lớn? Để ngày khác nếu được',
    'Im lặng là vàng khi gặp tuổi xung',
    'Ở nhà thêm chút cũng là một dạng may mắn',
  ],
};

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type DailyHoroscope = {
  overall: string;
  love: string;
  work: string;
  money: string;
  advice: string;
  /** Năm / tuổi context from can chi */
  yearHeadline: string;
  yearElement: ElementVi | null;
  yearAnimal: string | null;
  elementNote: string;
  dayCanChi: string;
  score: number;
  lockedPreview: string;
};

/**
 * Local tử vi pack: thiên can (ngũ hành) + địa chi (12 con giáp) + chất ngày.
 * Offline, no scrape — content generated from owned copy banks.
 */
export function buildDailyHoroscope(day: CalendarDay): DailyHoroscope {
  const yearCc = parseCanChi(day.canChi.year);
  const dayCc = parseCanChi(day.canChi.day);
  const animal =
    yearCc.animal ??
    (day.zodiac ? zodiacPackKey(day.zodiac) : null) ??
    'Ngựa';
  const packKey = zodiacPackKey(animal);
  const pack = ZODIAC_PACK[packKey] ?? ZODIAC_PACK.Ngựa;

  const seed = hashSeed(
    day.solar.year,
    day.solar.month,
    day.solar.day,
    day.lunar.day,
    day.canChi.day,
    day.canChi.year,
    day.dayPathTone,
  );

  const overallBase = pick(OVERALL_BY_TONE[day.dayPathTone], seed);
  const yearBit =
    yearCc.stem && yearCc.branch
      ? ` · khí năm ${yearCc.stem} ${yearCc.branch}`
      : '';
  const overall = `${overallBase}${yearBit}`;

  const love = pick(pack.love, seed + 3);
  const work = pick(pack.work, seed + 7);
  const money = pick(pack.money, seed + 11);
  const adviceCore = pick(pack.advice, seed + 13);
  const element = yearCc.element;
  const elementNote = element
    ? ELEMENT_TRAIT[element]
    : pack.temperament;
  const advice = `${adviceCore} ${element ? `(${element})` : ''}`.trim();

  // Score: tone baseline + day branch affinity with year branch
  let score = 58 + (seed % 28);
  if (day.dayPathTone === 'great') score += 12;
  else if (day.dayPathTone === 'good') score += 7;
  else if (day.dayPathTone === 'poor') score -= 6;
  else if (day.dayPathTone === 'bad') score -= 12;
  if (yearCc.branch && dayCc.branch === yearCc.branch) score += 5;
  score = Math.max(40, Math.min(98, score));

  const yearHeadline =
    yearCc.stem && yearCc.branch
      ? `Năm ${yearCc.stem} ${yearCc.branch}${yearCc.animal ? ` · tuổi ${yearCc.animal}` : ''}`
      : day.canChi.year;

  return {
    overall,
    love,
    work,
    money,
    advice,
    yearHeadline,
    yearElement: element,
    yearAnimal: yearCc.animal ?? packKey,
    elementNote: `${pack.temperament} ${elementNote}`,
    dayCanChi: day.canChi.day,
    score,
    lockedPreview: `${yearHeadline} · ${overallBase} · điểm ${score}/100. Mở để xem tình cảm, việc, tài theo khí năm.`,
  };
}
