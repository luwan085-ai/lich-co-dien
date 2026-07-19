import type { CalendarDay } from '../lunar/today';
import { findNextHoangHour } from './hoangHours';
import { travelHintForDay } from './travelDirection';

function joinShort(items: string[], fallback: string, max = 2): string {
  if (items.length === 0) return fallback;
  return items.slice(0, max).join(', ');
}

export function nenDigestLine(day: CalendarDay): string {
  const items = joinShort(day.shouldDo, 'khai trương, xuất hành');
  return `Nên: ${items.replace(/, /g, ' · ')}`;
}

export function kiengDigestLine(day: CalendarDay): string {
  const items = joinShort(day.avoidDo, 'quyết định vội');
  return `Kiêng: ${items.replace(/, /g, ' · ')}`;
}

export function statusDigestLine(day: CalendarDay): string {
  return `${day.dayPathLabel} · ${day.qualityLabel}`;
}

/** One-line giờ tốt for the paper poster bar. */
export function giờTotShortLine(day: CalendarDay): string | null {
  const next = findNextHoangHour(day.hoangHours);
  if (!next) return null;
  return `Giờ tốt: ${next.branch} ${next.time}`;
}

/** Poster footer — next lucky hour + travel bearing, no scroll. */
export function posterSummaryBar(day: CalendarDay): string {
  const hour = giờTotShortLine(day);
  const travel = travelHintForDay(day);
  const parts: string[] = [];
  if (hour) parts.push(hour);
  parts.push(`Hướng: ${travel.favorable}`);
  return parts.join(' · ');
}
