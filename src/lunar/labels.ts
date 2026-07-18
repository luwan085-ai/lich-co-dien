const LUNAR_MONTH_VI = [
  'Một',
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'Mười Một',
  'Mười Hai',
] as const;

const SOLAR_MONTH_EN = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

const WEEKDAY_EN = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const WEEKDAY_ZH = [
  '星期天',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
] as const;

export function lunarMonthName(month: number): string {
  return LUNAR_MONTH_VI[month - 1] ?? String(month);
}

export function solarMonthEn(month: number): string {
  return SOLAR_MONTH_EN[month - 1] ?? '';
}

export function weekdayEn(jsDay: number): string {
  return WEEKDAY_EN[jsDay] ?? '';
}

export function weekdayZh(jsDay: number): string {
  return WEEKDAY_ZH[jsDay] ?? '';
}

export function weekdayBanner(weekdayVi: string, jsDay: number): string {
  const short = weekdayVi.replace(/^Thứ\s+/i, 'THỨ ').toUpperCase();
  if (weekdayVi.toLowerCase().includes('chủ')) {
    return `CHỦ NHẬT - ${weekdayEn(jsDay)}`;
  }
  return `${short} - ${weekdayEn(jsDay)}`;
}
