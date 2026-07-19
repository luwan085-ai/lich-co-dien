import { Platform } from 'react-native';
import { fetchWithTimeout } from './fetchWithTimeout';

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

const FEED = 'https://vnexpress.net/rss/tin-moi-nhat.rss';
/** CORS-friendly reader for Expo web preview (returns markdown, not raw XML). */
const FEED_VIA_JINA = `https://r.jina.ai/https://vnexpress.net/rss/tin-moi-nhat.rss`;

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

/** Parse jina.ai markdown dump of the RSS page. */
function parseJinaMarkdown(md: string, limit = 3): NewsItem[] {
  const items: NewsItem[] = [];
  const re = /###\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    const title = m[1].trim();
    if (!title) continue;
    items.push({ title, source: 'VnExpress', link: m[2] });
    if (items.length >= limit) break;
  }
  return items;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      url,
      {
        headers: { Accept: 'application/rss+xml, text/xml, text/plain, */*' },
      },
      12_000,
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Fetch latest headlines (VnExpress RSS).
 * - Native: direct RSS (no CORS)
 * - Web: jina reader only — never hit blocked origins (avoids console CORS noise)
 * Falls back to local copy offline.
 */
export async function fetchDailyNews(): Promise<NewsItem[]> {
  if (Platform.OS === 'web') {
    const md = await fetchText(FEED_VIA_JINA);
    if (md) {
      const items = parseJinaMarkdown(md, 3);
      if (items.length) return items;
      // Sometimes jina still embeds XML fragments
      const fromXml = parseRssTitles(md, 3);
      if (fromXml.length) return fromXml;
    }
    return FALLBACK;
  }

  const xml = await fetchText(FEED);
  if (xml) {
    const items = parseRssTitles(xml, 3);
    if (items.length) return items;
  }
  return FALLBACK;
}
