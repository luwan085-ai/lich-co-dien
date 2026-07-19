import type { CalendarDay } from '../lunar/today';

const OVERALL = ['Đại cát', 'Cát', 'Bình', 'Nên thận trọng', 'Nên tĩnh dưỡng'] as const;
const LOVE = [
  'Giao tiếp chân thành mang lại ấm áp',
  'Tránh hiểu lầm nhỏ trong ngày',
  'Có tín hiệu tốt từ người thân quen',
  'Nên dành thời gian cho bản thân trước',
] as const;
const WORK = [
  'Công việc thuận nếu làm từng bước rõ',
  'Tránh quyết định vội vàng sau 15h',
  'Hợp hợp tác, chia sẻ ý tưởng ngắn gọn',
  'Tập trung một việc chính là đủ',
] as const;
const MONEY = [
  'Chi tiêu vừa phải, giữ quỹ dự phòng',
  'Có cơ hội nhỏ nếu kiên nhẫn',
  'Tránh cho mượn lớn trong ngày',
  'Hợp sắp xếp lại ngân sách cá nhân',
] as const;
const ADVICE = [
  'Uống nước ấm, đi bộ ngắn sẽ tốt hơn nghĩ nhiều',
  'Nói ít làm chắc — vận khí ủng hộ sự tỉnh táo',
  'Nhớ ơn một người hôm nay, lòng sẽ nhẹ',
  'Đừng để việc kiếm sống át mất nhịp sống',
] as const;

function pick<T extends readonly string[]>(arr: T, seed: number): T[number] {
  return arr[Math.abs(seed) % arr.length];
}

export type DailyHoroscope = {
  overall: string;
  love: string;
  work: string;
  money: string;
  advice: string;
  score: number;
  lockedPreview: string;
};

export function buildDailyHoroscope(day: CalendarDay): DailyHoroscope {
  const seed =
    day.solar.year * 372 +
    day.solar.month * 31 +
    day.solar.day +
    day.canChi.day.length * 17;

  const score = 55 + (Math.abs(seed) % 41);
  const overall = pick(OVERALL, seed);
  const love = pick(LOVE, seed + 3);
  const work = pick(WORK, seed + 7);
  const money = pick(MONEY, seed + 11);
  const advice = pick(ADVICE, seed + 13);

  return {
    overall,
    love,
    work,
    money,
    advice,
    score,
    lockedPreview: `${overall} · điểm ${score}/100. Xem đầy đủ để nhận chỉ dẫn hành động hôm nay.`,
  };
}
