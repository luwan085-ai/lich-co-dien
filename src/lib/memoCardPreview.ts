import { getCalendarDayForSolar } from '../lunar/today';
import type { UpcomingLunarEvent } from './lunarUpcoming';
import { formatSolarShort } from './gioSchedule';

export type MemoCardPreview = {
  headline: string;
  detail: string;
};

const TAP = 'chạm để mở';

function lunarShortForSolar(solar: UpcomingLunarEvent['solar']): string {
  const cal = getCalendarDayForSolar(solar, 12);
  const leap = cal.lunar.leapMonth ? ' nhuận' : '';
  return `${cal.lunar.day}/${cal.lunar.month}${leap}`;
}

function shortLabel(label: string, max = 28): string {
  const t = label.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Collapsed GHI CHÚ / GIỖ LỄ strip — giỗ-first, two lines. */
export function buildMemoCardPreview(
  nearest: UpcomingLunarEvent | null,
  memoText: string,
): MemoCardPreview {
  if (nearest) {
    const lunar = lunarShortForSolar(nearest.solar);
    const solarLine = `Dương lịch ${formatSolarShort(nearest.solar)} · ${TAP}`;

    if (nearest.daysUntil === 0) {
      if (nearest.kind === 'birthday') {
        return {
          headline: `Hôm nay có sinh nhật âm ${lunar}`,
          detail: solarLine,
        };
      }
      return {
        headline: `Hôm nay có giỗ âm ${lunar}`,
        detail: solarLine,
      };
    }

    const days =
      nearest.daysUntil === 1
        ? 'còn 1 ngày'
        : `còn ${nearest.daysUntil} ngày`;

    if (nearest.kind === 'birthday') {
      return {
        headline: `${shortLabel(nearest.label)} · ${days}`,
        detail: solarLine,
      };
    }

    return {
      headline: `${shortLabel(nearest.label)} · ${days}`,
      detail: solarLine,
    };
  }

  const trimmed = memoText.trim();
  if (trimmed) {
    return {
      headline: shortLabel(trimmed, 42),
      detail: `Ghi chú ngày này · ${TAP}`,
    };
  }

  return {
    headline: 'Thêm giỗ hoặc sinh nhật âm',
    detail: `Nhận nhắc hằng năm · ${TAP}`,
  };
}
