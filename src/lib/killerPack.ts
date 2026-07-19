import type { CalendarDay } from '../lunar/today';
import { parseCanChi, type Branch } from '../data/canChiMeta';
import { BRANCH_XUNG, tuoiXungForDayBranch } from '../data/xung';
import { VAN_KHAN, type VanKhanArticle, type VanKhanId } from '../data/vanKhan';
import { zodiacPackKey } from '../data/zodiacPack';

export type KillerHour = {
  branch: string;
  time: string;
  label: string;
  /** Raw hour (0–23) for comparison — never parse the display string. */
  startHour: number;
};

export type KillerXung = {
  dayBranch: Branch;
  xungBranch: Branch;
  ages: { label: string; year: number }[];
  headline: string;
  tip: string;
};

export type KillerLucky = {
  animal: string;
  numbers: number[];
  headline: string;
  /** Public KQXS result site (not a bet slip). */
  kqxsUrl: string;
  disclaimer: string;
};

export type KillerPack = {
  gioHoangDao: {
    title: string;
    desc: string;
    best: KillerHour | null;
    hours: KillerHour[];
    openShopLine: string;
  };
  tuoiXung: KillerXung;
  vanKhan: {
    title: string;
    active: VanKhanId | null;
    reason: string | null;
    articles: VanKhanArticle[];
    /** Auto-open suggest on Mùng 1 / Rằm */
    spotlight: VanKhanArticle | null;
  };
  taiLoc: KillerLucky;
};

function businessHours(day: CalendarDay): KillerHour[] {
  return (day.hoangHours ?? [])
    .map((h) => {
      const startHour = parseInt(h.time.split(':')[0] ?? '0', 10);
      return {
        branch: h.branch,
        time: h.time.replace(':00', 'h').replace('-', ' – '),
        label: `Giờ ${h.branch}`,
        startHour: Number.isFinite(startHour) ? startHour : 0,
      };
    })
    .filter((h) => h.startHour >= 7 && h.startHour < 20);
}

function pickBestBusiness(hours: KillerHour[]): KillerHour | null {
  if (!hours.length) return null;
  // Prefer morning open-shop window 7–11 (numeric, not display string)
  const morning = hours.find((h) => h.startHour >= 7 && h.startHour <= 11);
  return morning ?? hours[0];
}

/** Traditional VN local draw vibe — cặp số 00…99 (Số Đề / Lô Tô). */
function luckyNumbers(day: CalendarDay, animal: string): number[] {
  const seed =
    day.solar.year * 372 +
    day.solar.month * 31 +
    day.solar.day +
    animal.length * 17 +
    day.canChi.day.length * 3;
  const set = new Set<number>();
  let x = Math.abs(seed) || 1;
  while (set.size < 4) {
    x = (x * 1103515245 + 12345) >>> 0;
    set.add(x % 100);
  }
  return [...set].sort((a, b) => a - b);
}

/** Build daily killer pack for Tử vi tray. */
export function buildKillerPack(day: CalendarDay): KillerPack {
  const dayCc = parseCanChi(day.canChi.day);
  const dayBranch = (dayCc.branch ?? 'Ngọ') as Branch;
  const xungBranch = BRANCH_XUNG[dayBranch];
  const ages = tuoiXungForDayBranch(dayBranch).map((a) => ({
    label: a.label,
    year: a.year,
  }));

  const hours = businessHours(day);
  const best = pickBestBusiness(hours);
  const openShopLine = best
    ? `Giờ đẹp nhất để giao dịch/mở hàng hôm nay: ${best.time} (Giờ ${best.branch})`
    : 'Hôm nay ít giờ Hoàng Đạo ban ngày — ưu tiên việc nhỏ, tránh ký lớn.';

  const lunarDay = day.lunar.day;
  const isMung1 = lunarDay === 1;
  const isRam = lunarDay === 15;
  let active: VanKhanId | null = null;
  let reason: string | null = null;
  if (isMung1) {
    active = 'mung1';
    reason = `Hôm nay Mùng Một tháng ${day.lunar.month} âm · nên đọc văn khấn Thần Tài`;
  } else if (isRam) {
    active = 'ram';
    reason = `Hôm nay Rằm tháng ${day.lunar.month} âm · nên cúng gia tiên`;
  }

  const animal = zodiacPackKey(
    parseCanChi(day.canChi.year).animal ?? day.zodiac ?? 'Ngựa',
  );
  const numbers = luckyNumbers(day, animal);

  return {
    gioHoangDao: {
      title: '⚡ Giờ Hoàng Đạo (Giờ Tốt)',
      desc: 'Thời gian cát tường để ký hợp đồng, mở hàng, xuất hành.',
      best,
      hours: hours.slice(0, 4),
      openShopLine,
    },
    tuoiXung: {
      dayBranch,
      xungBranch,
      ages,
      headline: `Hôm nay kỵ tuổi: ${ages
        .slice(0, 3)
        .map((a) => `${a.label} (${a.year})`)
        .join(', ')}`,
      tip: `Ngày ${day.canChi.day} · địa chi ${dayBranch} xung ${xungBranch}. Tránh bàn chuyện làm ăn lớn với các tuổi trên.`,
    },
    vanKhan: {
      title: '📿 Văn Khấn Mùng 1 & Rằm',
      active,
      reason,
      articles: [VAN_KHAN.mung1, VAN_KHAN.ram, VAN_KHAN.thanTai],
      spotlight: active ? VAN_KHAN[active] : null,
    },
    taiLoc: {
      animal,
      numbers,
      headline: `Cặp số may mắn hôm nay cho tuổi ${animal}: ${numbers
        .map((n) => String(n).padStart(2, '0'))
        .join(', ')}`,
      kqxsUrl: 'https://xoso.com.vn/',
      disclaimer:
        'Gợi ý vui cặp số 00–99 (Số Đề / Lô Tô / xổ số kiến thiết). Không đảm bảo trúng thưởng. Vui chơi có trách nhiệm. Người dưới 18 tuổi không được tham gia.',
    },
  };
}
