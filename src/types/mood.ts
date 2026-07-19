export type Mood = 'happy' | 'calm' | 'angry' | 'sad' | 'jackpot';

/**
 * Top-3 VN elementary praise stamps (mộc khen ngợi) for daily ritual.
 * Làm tốt lắm! · Giỏi lắm! · Cô khen!
 */
export type Praise = 'lam_tot_lam' | 'gioi_lam' | 'co_khen';

export type DatePageRecord = {
  moodStamp?: Mood;
  praiseStamp?: Praise;
  praiseInkSeed?: number;
};

export const MOOD_STAMPS: {
  id: Mood;
  labelVi: string;
  char: string;
  color: string;
}[] = [
  { id: 'happy', labelVi: 'Vui', char: '喜', color: '#C41E3A' },
  { id: 'calm', labelVi: 'An', char: '安', color: '#2F6F4E' },
  { id: 'angry', labelVi: 'Giận', char: '怒', color: '#8B1520' },
  { id: 'sad', labelVi: 'Buồn', char: '憂', color: '#4A5568' },
  { id: 'jackpot', labelVi: 'Đại cát', char: '發', color: '#B8860B' },
];

/** Bright stamp-pad red (mực dấu đỏ tươi). */
export const STAMP_RED = '#E83A24';

/** Grade for later 다짐 auto-stamp: standard / premium / warm */
export type PraiseGrade = 'standard' | 'premium' | 'warm';

export const PRAISE_STAMPS: {
  id: Praise;
  grade: PraiseGrade;
  labelVi: string;
  lines: string[];
  tilt: number;
}[] = [
  {
    id: 'lam_tot_lam',
    grade: 'standard',
    labelVi: 'Làm tốt lắm',
    lines: ['Làm tốt lắm!'],
    tilt: 4,
  },
  {
    id: 'gioi_lam',
    grade: 'premium',
    labelVi: 'Giỏi lắm',
    lines: ['Giỏi lắm!'],
    tilt: -6,
  },
  {
    id: 'co_khen',
    grade: 'warm',
    labelVi: 'Cô khen',
    lines: ['Cô khen!'],
    tilt: -3,
  },
];
