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
  };
  weekdayVi: string;
  weekdayBanner: string;
  weekdayZh: string;
  yearCanChiUpper: string;
  solarMonthLine: string;
  hoangHours: HoangHour[];
  favorable: string;
  metaLine: string;
  quote: { text: string; author: string };
  isGoodDay: boolean;
};

function jsWeekday(solar: SolarDate): number {
  return new Date(Date.UTC(solar.year, solar.month - 1, solar.day, 12)).getUTCDay();
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

  const should = display.recommendations.should ?? [];
  const favorable =
    should.length > 0
      ? should.slice(0, 4).join(', ')
      : display.hoangDao.isGoodDay
        ? 'Xuất hành, cúng bái, gặp gỡ'
        : (display.recommendations.avoid ?? []).length > 0
          ? `Kiêng: ${(display.recommendations.avoid ?? []).slice(0, 3).join(', ')}`
          : 'Giữ bình an trong ngày';

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
    },
    weekdayVi: display.date.weekday,
    weekdayBanner: weekdayBanner(display.date.weekday, wd),
    weekdayZh: weekdayZh(wd),
    yearCanChiUpper: display.canChi.year.toUpperCase(),
    solarMonthLine: `THÁNG ${solar.month} / ${solarMonthEn(solar.month)}`,
    hoangHours: display.hoangDao.hours ?? [],
    favorable,
    metaLine: [
      display.zodiac ? `Tuổi ${display.zodiac}` : null,
      display.truc ? `Trực ${display.truc}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    quote: quoteForDate(solar.year, solar.month, solar.day),
    isGoodDay: display.hoangDao.isGoodDay,
  };
}

export function getCalendarDay(now = new Date()): CalendarDay {
  return getCalendarDayForSolar(getVietnamSolarToday(now));
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
