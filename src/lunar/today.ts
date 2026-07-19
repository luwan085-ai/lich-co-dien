import {
  analyzeDay,
  getCanChiHourFromSolar,
  getLunarMonthLength,
  toDisplayObject,
} from '@baostudio/viet-lunar';
import { quoteForDate } from '../data/quotes';
import {
  lunarMonthName,
  solarMonthEn,
  weekdayBanner,
  weekdayZh,
} from './labels';
import type { SolarDate } from './solar';
import { getVietnamSolarToday } from './vietnamTime';

export type HoangHour = {
  branch: string;
  time: string;
};

export type DayQualityTone = 'great' | 'good' | 'neutral' | 'poor' | 'bad';

export type CalendarDay = {
  solar: SolarDate;
  lunar: {
    year: number;
    month: number;
    day: number;
    leapMonth: boolean;
    monthLabel: string;
    lengthLabel: string;
  };
  canChi: {
    year: string;
    month: string;
    day: string;
    hour: string;
    hourBranch: string;
  };
  weekdayVi: string;
  weekdayBanner: string;
  weekdayZh: string;
  yearCanChiUpper: string;
  solarMonthLine: string;
  hoangHours: HoangHour[];
  favorable: string;
  shouldDo: string[];
  avoidDo: string[];
  dayPathLabel: string;
  dayPathTone: DayQualityTone;
  qualityLabel: string;
  summaryLine: string;
  metaLine: string;
  quote: { text: string; author: string };
  isGoodDay: boolean;
  truc: string | null;
  zodiac: string | null;
};

function jsWeekday(solar: SolarDate): number {
  return new Date(Date.UTC(solar.year, solar.month - 1, solar.day, 12)).getUTCDay();
}

function mapQuality(raw: string | undefined, isGoodDay: boolean): {
  tone: DayQualityTone;
  pathLabel: string;
  qualityLabel: string;
} {
  const q = (raw ?? 'neutral').toLowerCase();
  if (q === 'excellent' || q === 'great') {
    return {
      tone: 'great',
      pathLabel: 'Ngày Hoàng Đạo',
      qualityLabel: 'Đại cát',
    };
  }
  if (q === 'good') {
    return {
      tone: 'good',
      pathLabel: 'Ngày Hoàng Đạo',
      qualityLabel: 'Cát',
    };
  }
  if (q === 'bad') {
    return {
      tone: 'bad',
      pathLabel: 'Ngày Hắc Đạo',
      qualityLabel: 'Nên thận trọng',
    };
  }
  if (q === 'poor') {
    return {
      tone: 'poor',
      pathLabel: isGoodDay ? 'Ngày bình thường' : 'Ngày Hắc Đạo',
      qualityLabel: 'Nên tĩnh dưỡng',
    };
  }
  return {
    tone: 'neutral',
    pathLabel: isGoodDay ? 'Ngày Hoàng Đạo' : 'Ngày bình thường',
    qualityLabel: 'Bình',
  };
}

/** Build calendar page data for a specific solar date (date-page architecture). */
export function getCalendarDayForSolar(
  solar: SolarDate,
  hour = 12,
): CalendarDay {
  const analysis = analyzeDay(solar);
  const display = toDisplayObject(analysis);
  const monthLen = getLunarMonthLength({
    year: analysis.lunar.year,
    month: analysis.lunar.month,
    leapMonth: analysis.lunar.leapMonth,
  });
  const hourCc = getCanChiHourFromSolar(solar, hour);
  const wd = jsWeekday(solar);
  const leap = analysis.lunar.leapMonth ? ' (Nhuận)' : '';
  const monthName = lunarMonthName(analysis.lunar.month);

  const shouldDo = [
    ...(display.recommendations.should ?? []),
    ...((analysis as { nen?: string[] }).nen ?? []),
  ].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

  const avoidDo = [
    ...(display.recommendations.avoid ?? []),
    ...((analysis as { kieng?: string[] }).kieng ?? []),
  ].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

  const { tone, pathLabel, qualityLabel } = mapQuality(
    String(display.quality ?? analysis.quality ?? 'neutral'),
    Boolean(display.hoangDao.isGoodDay),
  );

  const favorable =
    shouldDo.length > 0
      ? shouldDo.slice(0, 4).join(', ')
      : display.hoangDao.isGoodDay
        ? 'Xuất hành, cúng bái, gặp gỡ'
        : avoidDo.length > 0
          ? `Kiêng: ${avoidDo.slice(0, 3).join(', ')}`
          : 'Giữ bình an trong ngày';

  const summaryLine =
    avoidDo.length > 0 && shouldDo.length === 0
      ? `${pathLabel} · Kiêng ${avoidDo.slice(0, 2).join(', ')}`
      : shouldDo.length > 0
        ? `${pathLabel} · Nên ${shouldDo.slice(0, 2).join(', ')}`
        : `${pathLabel} · ${qualityLabel}`;

  return {
    solar,
    lunar: {
      year: analysis.lunar.year,
      month: analysis.lunar.month,
      day: analysis.lunar.day,
      leapMonth: analysis.lunar.leapMonth,
      monthLabel: `THÁNG ${monthName.toUpperCase()}${leap}`,
      lengthLabel: monthLen >= 30 ? 'ĐỦ' : 'THIẾU',
    },
    canChi: {
      year: display.canChi.year,
      month: display.canChi.month,
      day: display.canChi.day,
      hour: `${hourCc.stem} ${hourCc.branch}`,
      hourBranch: hourCc.branch,
    },
    weekdayVi: display.date.weekday,
    weekdayBanner: weekdayBanner(display.date.weekday, wd),
    weekdayZh: weekdayZh(wd),
    yearCanChiUpper: display.canChi.year.toUpperCase(),
    solarMonthLine: `THÁNG ${solar.month} / ${solarMonthEn(solar.month)}`,
    hoangHours: display.hoangDao.hours ?? [],
    favorable,
    shouldDo: shouldDo.slice(0, 6),
    avoidDo: avoidDo.slice(0, 6),
    dayPathLabel: pathLabel,
    dayPathTone: tone,
    qualityLabel,
    summaryLine,
    metaLine: [
      display.zodiac ? `Tuổi ${display.zodiac}` : null,
      display.truc ? `Trực ${display.truc}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    quote: quoteForDate(solar.year, solar.month, solar.day),
    isGoodDay: display.hoangDao.isGoodDay,
    truc: display.truc ?? null,
    zodiac: display.zodiac ?? null,
  };
}

export function getCalendarDay(now = new Date()): CalendarDay {
  return getCalendarDayForSolar(getVietnamSolarToday(now));
}

export function getMonthGrid(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
  const cells: Array<
    | null
    | {
        solar: SolarDate;
        lunarDay: number;
        tone: DayQualityTone;
        isToday: boolean;
      }
  > = [];

  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);

  const today = getVietnamSolarToday();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const solar = { year, month, day };
    const d = getCalendarDayForSolar(solar, 12);
    cells.push({
      solar,
      lunarDay: d.lunar.day,
      tone: d.dayPathTone,
      isToday:
        today.year === year && today.month === month && today.day === day,
    });
  }

  return { firstWeekday, daysInMonth, cells };
}

/** @deprecated Use getCalendarDay */
export function getTodayLunar(now = new Date()) {
  const d = getCalendarDay(now);
  return {
    solarLabel: `${d.solar.day}/${d.solar.month}/${d.solar.year}`,
    lunarDay: d.lunar.day,
    lunarMonth: d.lunar.month,
    lunarYear: d.lunar.year,
    leapMonth: d.lunar.leapMonth,
    lunarLabel: `Mồng ${d.lunar.day} Tháng ${d.lunar.month} năm ${d.lunar.year}`,
    yearCanChi: d.canChi.year,
    weekdayVi: d.weekdayVi,
  };
}

export { getVietnamSolarToday } from './vietnamTime';
