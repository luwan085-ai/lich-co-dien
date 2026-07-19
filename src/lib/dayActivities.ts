type DayQualityTone = 'great' | 'good' | 'neutral' | 'poor' | 'bad';
const AGGRESSIVE_NEN = new Set([
  'khai trương',
  'xuất hành',
  'cưới hỏi',
  'động thổ',
  'ký kết',
  'ký hợp đồng',
  'mua nhà',
  'khởi công',
  'xuất hành xa',
  'an cư',
  'nhập trạch',
]);

/** Nên an toàn khi ngày Hắc / cần thận trọng. */
const CONSERVATIVE_NEN = [
  'việc nhỏ',
  'chuẩn bị',
  'cúng bái',
  'dọn dẹp',
  'sắp xếp',
];

export function normalizeActivityKey(text: string): string {
  return text.trim().toLowerCase().normalize('NFC');
}

function activityTokens(text: string): string[] {
  return normalizeActivityKey(text)
    .split(/[,·/|;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** True when two activity strings refer to the same act (exact or shared token). */
export function activitiesConflict(a: string, b: string): boolean {
  const na = normalizeActivityKey(a);
  const nb = normalizeActivityKey(b);
  if (na === nb) return true;
  const ta = activityTokens(a);
  const tb = activityTokens(b);
  for (const x of ta) {
    for (const y of tb) {
      if (x === y || x.includes(y) || y.includes(x)) return true;
    }
  }
  return false;
}

function isAggressiveNen(item: string): boolean {
  return activityTokens(item).some((t) => AGGRESSIVE_NEN.has(t));
}

function dedupeShouldFromAvoid(should: string[], avoid: string[]): string[] {
  return should.filter(
    (s) => !avoid.some((a) => activitiesConflict(s, a)),
  );
}

function conservativeNenForBadDay(avoid: string[]): string[] {
  const blocked = new Set(avoid.flatMap((a) => activityTokens(a)));
  const picked: string[] = [];
  for (const item of CONSERVATIVE_NEN) {
    if (blocked.has(normalizeActivityKey(item))) continue;
    picked.push(item);
    if (picked.length >= 2) break;
  }
  return picked.length > 0 ? picked : ['việc nhỏ', 'chuẩn bị'];
}

export function isCautiousDayTone(tone: DayQualityTone): boolean {
  return tone === 'bad' || tone === 'poor';
}

/** Kiêng wins on conflict; Hắc Đạo → conservative Nên. */
export function resolveDayActivities(
  rawShould: string[],
  rawAvoid: string[],
  tone: DayQualityTone,
): { shouldDo: string[]; avoidDo: string[] } {
  const avoidDo = rawAvoid
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((x) => activitiesConflict(x, v)) === i);

  let shouldDo = rawShould
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex((x) => activitiesConflict(x, v)) === i);

  shouldDo = dedupeShouldFromAvoid(shouldDo, avoidDo);

  if (isCautiousDayTone(tone)) {
    shouldDo = shouldDo.filter((s) => !isAggressiveNen(s));
    if (shouldDo.length === 0) {
      shouldDo = conservativeNenForBadDay(avoidDo);
    }
    shouldDo = shouldDo.slice(0, 2);
  } else {
    shouldDo = shouldDo.slice(0, 6);
  }

  return { shouldDo, avoidDo: avoidDo.slice(0, 6) };
}

export function nenFallbackForTone(tone: DayQualityTone): string {
  return isCautiousDayTone(tone)
    ? 'việc nhỏ, chuẩn bị'
    : 'khai trương, xuất hành';
}

export function kiengFallbackForTone(_tone: DayQualityTone): string {
  return 'quyết định vội';
}
