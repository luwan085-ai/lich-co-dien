/** Ca dao / tục ngữ Việt — daily page center copy. */
export const DAILY_QUOTES = [
  {
    text: 'Công cha như núi Thái Sơn, nghĩa mẹ như nước trong nguồn chảy ra',
    author: 'Ca dao Việt Nam',
  },
  {
    text: 'Ăn quả nhớ kẻ trồng cây',
    author: 'Tục ngữ Việt Nam',
  },
  {
    text: 'Lá lành đùm lá rách',
    author: 'Tục ngữ Việt Nam',
  },
  {
    text: 'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao',
    author: 'Ca dao Việt Nam',
  },
  {
    text: 'Ở hiền gặp lành',
    author: 'Tục ngữ Việt Nam',
  },
  {
    text: 'Có công mài sắt, có ngày nên kim',
    author: 'Tục ngữ Việt Nam',
  },
  {
    text: 'Đường đi khó, không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông',
    author: 'Nguyễn Bá Học',
  },
] as const;

export function quoteForDate(year: number, month: number, day: number) {
  const idx = (year * 372 + month * 31 + day) % DAILY_QUOTES.length;
  return DAILY_QUOTES[idx];
}
