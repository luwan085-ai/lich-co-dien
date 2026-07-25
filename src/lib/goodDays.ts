import { addSolarDays, type SolarDate } from '../lunar/solar';
import { getCalendarDayForSolar } from '../lunar/today';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { daysBetween } from './gioSchedule';

export type GoodDayPurpose =
  | 'khai_truong'
  | 'nhap_trach'
  | 'ky_hop_dong'
  | 'mua_xe'
  | 'xuat_hanh';

export type PurposeMeta = {
  id: GoodDayPurpose;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  keywords: string[];
};

export const PURPOSE_LIST: PurposeMeta[] = [
  {
    id: 'khai_truong',
    label: 'Khai trương · Mở cửa hàng',
    shortLabel: 'Khai trương',
    icon: '🧧',
    description: 'Chọn ngày Hoàng Đạo tốt cho mở hàng, khai trương kinh doanh.',
    keywords: ['khai trương', 'mở hàng', 'ký kết', 'giao dịch'],
  },
  {
    id: 'nhap_trach',
    label: 'Nhập trạch · Dọn về nhà mới',
    shortLabel: 'Nhập trạch',
    icon: '🏡',
    description: 'Chọn ngày cát lành cho việc dọn dẹp, di chuyển về nhà mới.',
    keywords: ['nhập trạch', 'an cư', 'dọn dẹp', 'mới'],
  },
  {
    id: 'ky_hop_dong',
    label: 'Ký hợp đồng · Giao dịch',
    shortLabel: 'Ký hợp đồng',
    icon: '🖋️',
    description: 'Chọn ngày đẹp để ký kết, giao dịch tài chính quan trọng.',
    keywords: ['ký kết', 'ký hợp đồng', 'giao dịch', 'khai trương'],
  },
  {
    id: 'mua_xe',
    label: 'Mua xe · Nhận xe mới',
    shortLabel: 'Mua xe',
    icon: '🚗',
    description: 'Chọn ngày tốt mang lại bình an khi mua xe, nhận xe.',
    keywords: ['mua xe', 'xuất hành', 'giao dịch'],
  },
  {
    id: 'xuat_hanh',
    label: 'Xuất hành · Đi xa',
    shortLabel: 'Xuất hành',
    icon: '✈️',
    description: 'Chọn ngày Hoàng Đạo thuận lợi cho chuyến đi xa, công tác.',
    keywords: ['xuất hành', 'xuất hành xa', 'đi xa'],
  },
];

export type RecommendedGoodDay = {
  solar: SolarDate;
  dateKey: string;
  lunarLabel: string;
  dayOfWeekLabel: string;
  daysUntil: number;
  hoangDaoName: string;
  matchedReason: string;
  shouldDo: string[];
};

const DAY_NAMES_VI = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

function getDayOfWeekName(solar: SolarDate): string {
  const dt = new Date(Date.UTC(solar.year, solar.month - 1, solar.day));
  return DAY_NAMES_VI[dt.getUTCDay()] ?? 'Thứ Hai';
}

export function findGoodDaysForPurpose(
  purpose: GoodDayPurpose,
  from?: SolarDate,
  maxResults = 5,
  scanDays = 60,
): RecommendedGoodDay[] {
  const start = from ?? getVietnamSolarToday();
  const meta = PURPOSE_LIST.find((p) => p.id === purpose) ?? PURPOSE_LIST[0]!;
  const results: RecommendedGoodDay[] = [];

  for (let i = 0; i < scanDays && results.length < maxResults; i += 1) {
    const solar = addSolarDays(start, i);
    const cal = getCalendarDayForSolar(solar, 12);

    // Filter for good day (isGoodDay or great/good/neutral tone)
    if (!cal.isGoodDay && cal.dayPathTone !== 'great' && cal.dayPathTone !== 'good') {
      continue;
    }

    const lowerShould = cal.shouldDo.map((s) => s.toLowerCase());

    // Check keyword match or general good day status
    const hasKeyword = meta.keywords.some((kw) =>
      lowerShould.some((s) => s.includes(kw)),
    );

    const dateKey = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`;
    const lunarLabel = `${cal.lunar.day}/${cal.lunar.month}${cal.lunar.leapMonth ? ' nhuận' : ''} âm`;
    const dayOfWeekLabel = getDayOfWeekName(solar);
    const daysUntil = daysBetween(start, solar);
    const hoangDaoName = cal.dayPathLabel;
    const matchedReason = hasKeyword
      ? `${hoangDaoName} · Rất tốt cho ${meta.shortLabel.toLowerCase()}`
      : `${hoangDaoName} · Thuận lợi mọi việc`;

    results.push({
      solar,
      dateKey,
      lunarLabel,
      dayOfWeekLabel,
      daysUntil,
      hoangDaoName,
      matchedReason,
      shouldDo: cal.shouldDo,
    });
  }

  return results;
}
