export type NewsItem = {
  title: string;
  source: string;
  link?: string;
};

const FALLBACK: NewsItem[] = [
  {
    title: 'Thời tiết đẹp thuận lợi cho các hoạt động ngoài trời tại TP.HCM',
    source: 'Lịch Cổ Điển',
  },
  {
    title: 'Giá vàng trong nước biến động nhẹ, người mua nên theo dõi sát',
    source: 'Lịch Cổ Điển',
  },
  {
    title: 'Cuối tuần nhiều sự kiện văn hóa tại Hà Nội và Đà Nẵng',
    source: 'Lịch Cổ Điển',
  },
];

function stripTags(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseRssTitles(xml: string, limit = 3): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const block of blocks) {
    const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    if (!titleMatch) continue;
    const title = stripTags(titleMatch[1]);
    if (!title) continue;
    items.push({
      title,
      source: 'VnExpress',
      link: linkMatch ? stripTags(linkMatch[1]) : undefined,
    });
    if (items.length >= limit) break;
  }
  return items;
}

/** Fetch latest headlines (VnExpress RSS). Falls back to local copy offline. */
export async function fetchDailyNews(): Promise<NewsItem[]> {
  const feed = 'https://vnexpress.net/rss/tin-moi-nhat.rss';
  const endpoints = [
    // allorigins helps browser CORS on Expo web
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feed)}`,
    feed,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/rss+xml, text/xml, */*' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRssTitles(xml, 3);
      if (items.length) return items;
    } catch {
      // try next
    }
  }
  return FALLBACK;
}
