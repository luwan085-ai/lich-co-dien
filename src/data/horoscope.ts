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

const CAUTION_BY_TONE: Record<CalendarDay['dayPathTone'], string[]> = {
  great: [
    'Đừng quá tự tin — kiểm tra chi tiết trước khi ký',
    'Tránh khoe khoang việc chưa chắc chắn',
  ],
  good: [
    'Tránh nhận thêm cam kết ngoài kế hoạch',
    'Đừng tranh luận trên mạng xã hội chiều nay',
  ],
  neutral: [
    'Tránh quyết định vội khi đói hoặc mệt',
    'Hạn chế chi tiêu cảm xúc buổi tối',
  ],
  poor: [
    'Tránh ký hợp đồng lớn hoặc vay mượn thêm',
    'Hạn chế rượu bia — dễ nói quá',
  ],
  bad: [
    'Tránh cưới hỏi · khai trương · xuất hành xa',
    'Tránh tranh cãi với tuổi xung hôm nay',
  ],
};

const HEALTH_LINES: string[] = [
  'Ngủ đủ 7h — sáng mai khí sẽ nhẹ hơn',
  'Uống nước đều, tránh ngồi lâu một chỗ',
  'Đi bộ ngắn sau bữa trưa giúp tỉnh táo',
  'Ăn chậm, tránh cay nóng buổi tối',
  'Giữ lưng ấm nếu trời mưa lạnh',
];

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

function facetScore(
  seed: number,
  offset: number,
  tone: CalendarDay['dayPathTone'],
): number {
  let s = 50 + ((seed + offset) % 36);
  if (tone === 'great') s += 10;
  else if (tone === 'good') s += 5;
  else if (tone === 'poor') s -= 7;
  else if (tone === 'bad') s -= 14;
  return Math.max(35, Math.min(96, s));
}

export type FacetScores = {
  love: number;
  work: number;
  money: number;
  health: number;
};

export type DailyHoroscope = {
  overall: string;
  love: string;
  work: string;
  money: string;
  health: string;
  advice: string;
  adviceLines: [string, string, string];
  cautionLine: string;
  facetScores: FacetScores;
  personalHeadline: string;
  personalSub: string;
  yearHeadline: string;
  yearElement: ElementVi | null;
  yearAnimal: string | null;
  userAnimal: string;
  elementNote: string;
  dayCanChi: string;
  score: number;
  lockedPreview: string;
  profileConfigured: boolean;
};

/**
 * Local tử vi pack — personalized by user's tuổi when set in Cá nhân.
 */
export function buildDailyHoroscope(
  day: CalendarDay,
  profileAnimal?: string | null,
): DailyHoroscope {
  const yearCc = parseCanChi(day.canChi.year);
  const dayCc = parseCanChi(day.canChi.day);
  const calendarAnimal =
    yearCc.animal ??
    (day.zodiac ? zodiacPackKey(day.zodiac) : null) ??
    'Ngựa';
  const userAnimal = profileAnimal
    ? zodiacPackKey(profileAnimal)
    : calendarAnimal;
  const packKey = zodiacPackKey(userAnimal);
  const pack = ZODIAC_PACK[packKey] ?? ZODIAC_PACK.Ngựa;

  const seed = hashSeed(
    day.solar.year,
    day.solar.month,
    day.solar.day,
    day.lunar.day,
    day.canChi.day,
    userAnimal,
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
  const health = pick(HEALTH_LINES, seed + 15);
  const adviceCore = pick(pack.advice, seed + 13);
  const element = yearCc.element;
  const elementNote = element
    ? ELEMENT_TRAIT[element]
    : pack.temperament;
  const advice = `${adviceCore} ${element ? `(${element})` : ''}`.trim();
  const adviceLines: [string, string, string] = [
    adviceCore,
    pick(pack.love, seed + 19),
    pick(OVERALL_BY_TONE[day.dayPathTone], seed + 23),
  ];
  const cautionLine =
    day.avoidDo[0]?.trim() ||
    pick(CAUTION_BY_TONE[day.dayPathTone], seed + 27);

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

  const profileConfigured = Boolean(profileAnimal);
  const personalHeadline = profileConfigured
    ? `Hôm nay của tuổi ${userAnimal}`
    : `Khí ngày · tuổi ${userAnimal}`;
  const personalSub = profileConfigured
    ? `${day.weekdayVi} · ${pack.temperament}`
    : `Chọn tuổi trong Cá nhân để cá nhân hóa · ${pack.temperament}`;

  return {
    overall,
    love,
    work,
    money,
    health,
    advice,
    adviceLines,
    cautionLine: `Hôm nay nên tránh: ${cautionLine}`,
    facetScores: {
      love: facetScore(seed, 3, day.dayPathTone),
      work: facetScore(seed, 7, day.dayPathTone),
      money: facetScore(seed, 11, day.dayPathTone),
      health: facetScore(seed, 15, day.dayPathTone),
    },
    personalHeadline,
    personalSub,
    yearHeadline,
    yearElement: element,
    yearAnimal: userAnimal,
    userAnimal,
    elementNote: `${pack.temperament} ${elementNote}`,
    dayCanChi: day.canChi.day,
    score,
    profileConfigured,
    lockedPreview: `${personalHeadline} · ${overallBase} · điểm ${score}/100.`,
  };
}
