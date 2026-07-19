import { STEMS, BRANCHES, type Branch, type Stem } from './canChiMeta';

/** Địa chi lục xung */
export const BRANCH_XUNG: Record<Branch, Branch> = {
  Tý: 'Ngọ',
  Sửu: 'Mùi',
  Dần: 'Thân',
  Mão: 'Dậu',
  Thìn: 'Tuất',
  Tỵ: 'Hợi',
  Ngọ: 'Tý',
  Mùi: 'Sửu',
  Thân: 'Dần',
  Dậu: 'Mão',
  Tuất: 'Thìn',
  Hợi: 'Tỵ',
};

/**
 * Sexagenary year label for a solar calendar year (approx. after Tết).
 * Offset: 1984 = Giáp Tý (index 0).
 */
export function yearCanChiLabel(solarYear: number): { stem: Stem; branch: Branch; label: string } {
  const idx = ((solarYear - 1984) % 60 + 60) % 60;
  const stem = STEMS[idx % 10];
  const branch = BRANCHES[idx % 12];
  return { stem, branch, label: `${stem} ${branch}` };
}

/** Birth years (recent adult range) whose năm tuổi xung with day branch. */
export function tuoiXungForDayBranch(
  dayBranch: Branch,
  rangeStart = 1960,
  rangeEnd = 2012,
): { label: string; year: number; branch: Branch }[] {
  const bad = BRANCH_XUNG[dayBranch];
  const out: { label: string; year: number; branch: Branch }[] = [];
  for (let y = rangeStart; y <= rangeEnd; y += 1) {
    const cc = yearCanChiLabel(y);
    if (cc.branch === bad) {
      out.push({ label: cc.label, year: y, branch: cc.branch });
    }
  }
  // Prefer one sample per 12-year cycle (newest first), max 4
  const picked: typeof out = [];
  const seenCycle = new Set<number>();
  for (let i = out.length - 1; i >= 0; i -= 1) {
    const cycle = out[i].year % 12;
    if (seenCycle.has(cycle)) continue;
    seenCycle.add(cycle);
    picked.push(out[i]);
    if (picked.length >= 4) break;
  }
  return picked.sort((a, b) => b.year - a.year);
}
