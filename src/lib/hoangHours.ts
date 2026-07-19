import type { CalendarDay, HoangHour } from '../lunar/today';
import { getVietnamHour } from '../lunar/vietnamTime';

export function hourStart(time: string): number {
  const part = time.split('-')[0]?.trim() ?? time;
  return parseInt(part.split(':')[0] ?? '0', 10);
}

export function isHourActive(time: string, nowH: number): boolean {
  const parts = time.split('-').map((p) => p.trim());
  if (parts.length < 2) {
    const start = parseInt(parts[0]?.split(':')[0] ?? '0', 10);
    return Number.isFinite(start) && start === nowH;
  }
  const start = parseInt(parts[0]?.split(':')[0] ?? '0', 10);
  const end = parseInt(parts[1]?.split(':')[0] ?? '0', 10);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  if (start <= end) return nowH >= start && nowH < end;
  return nowH >= start || nowH < end;
}

export function findNextHoangHour(
  hours: HoangHour[],
  nowH = getVietnamHour(),
): HoangHour | null {
  if (!hours.length) return null;
  const future = hours.find((h) => hourStart(h.time) > nowH);
  if (future) return future;
  for (const h of hours) {
    if (isHourActive(h.time, nowH)) return h;
  }
  return hours[0] ?? null;
}

export function findNextHoangIndex(
  hours: HoangHour[],
  nowH = getVietnamHour(),
): number {
  const future = hours.findIndex((h) => hourStart(h.time) > nowH);
  if (future >= 0) return future;
  for (let i = 0; i < hours.length; i += 1) {
    if (isHourActive(hours[i].time, nowH)) return i;
  }
  return -1;
}

/** Label line for paper card footer. */
export function nextHoangHourLine(day: CalendarDay): string | null {
  const next = findNextHoangHour(day.hoangHours);
  if (!next) return null;
  const nowH = getVietnamHour();
  const inSlot = isHourActive(next.time, nowH);
  const prefix = inSlot ? 'Giờ tốt hiện tại' : 'Giờ tốt tiếp theo';
  return `${prefix}: ${next.time} ${next.branch}`;
}
