import type { CalendarDay } from '../lunar/today';

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
