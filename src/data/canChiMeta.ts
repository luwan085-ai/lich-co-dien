/** Thiên can (Heavenly stems) */
export const STEMS = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;

/** Địa chi (Earthly branches) */
export const BRANCHES = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];
export type ElementVi = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';

export const STEM_ELEMENT: Record<Stem, ElementVi> = {
  Giáp: 'Mộc',
  Ất: 'Mộc',
  Bính: 'Hỏa',
  Đinh: 'Hỏa',
  Mậu: 'Thổ',
  Kỷ: 'Thổ',
  Canh: 'Kim',
  Tân: 'Kim',
  Nhâm: 'Thủy',
  Quý: 'Thủy',
};

export const BRANCH_ANIMAL: Record<Branch, string> = {
  Tý: 'Chuột',
  Sửu: 'Trâu',
  Dần: 'Hổ',
  Mão: 'Mèo',
  Thìn: 'Rồng',
  Tỵ: 'Rắn',
  Ngọ: 'Ngựa',
  Mùi: 'Dê',
  Thân: 'Khỉ',
  Dậu: 'Gà',
  Tuất: 'Chó',
  Hợi: 'Lợn',
};

export type ParsedCanChi = {
  raw: string;
  stem: Stem | null;
  branch: Branch | null;
  element: ElementVi | null;
  animal: string | null;
};

/** Parse "Bính Ngọ" / "Giáp Ngọ" style labels from viet-lunar. */
export function parseCanChi(raw: string | null | undefined): ParsedCanChi {
  const text = (raw ?? '').trim();
  if (!text) {
    return { raw: '', stem: null, branch: null, element: null, animal: null };
  }
  const parts = text.split(/\s+/);
  const stemPart = parts[0] as Stem;
  const branchPart = (parts[1] ?? '') as Branch;
  const stem = STEMS.includes(stemPart) ? stemPart : null;
  const branch = BRANCHES.includes(branchPart) ? branchPart : null;
  return {
    raw: text,
    stem,
    branch,
    element: stem ? STEM_ELEMENT[stem] : null,
    animal: branch ? BRANCH_ANIMAL[branch] : null,
  };
}

export const ELEMENT_TRAIT: Record<ElementVi, string> = {
  Hỏa: 'Năng lượng nóng, hợp cảm, thích dẫn dắt — giữ nhịp không để nóng vội.',
  Thủy: 'Linh hoạt, sâu lắng — hợp quan sát trước rồi mới quyết.',
  Mộc: 'Sinh trưởng, mở hướng mới — kiên nhẫn sẽ ra hoa.',
  Kim: 'Rõ ràng, kỷ luật — cắt bỏ việc thừa thì vận sáng.',
  Thổ: 'Ổn định, giữ gốc — chăm gốc rễ trước khi mở rộng.',
};
