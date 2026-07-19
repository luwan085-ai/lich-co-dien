import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithTimeout } from './fetchWithTimeout';

export type PetrolRegion = 1 | 2;

export type MarketQuote = {
  label: string;
  buy?: number;
  sell?: number;
  /** Single retail price (petrol) */
  price?: number;
  unit: string;
  region?: string;
};

export type MarketBoard = {
  gold: MarketQuote | null;
  petrol: MarketQuote[];
  region: PetrolRegion;
  updatedLabel: string;
  /** true when using hardcoded offline snapshot */
  isFallback: boolean;
  /** gold from live API */
  goldLive: boolean;
  /** petrol from live scrape */
  petrolLive: boolean;
  sourceNote: string;
};

const REGION_KEY = 'lich_petrol_region_v1';

const GOLD_FALLBACK: MarketQuote = {
  label: 'SJC 9999',
  buy: 144_500_000,
  sell: 147_500_000,
  unit: 'đ/lượng',
};

const PETROL_FALLBACK: Record<PetrolRegion, MarketQuote[]> = {
  1: [
    { label: 'Xăng E10 RON 95-V', price: 21_750, unit: 'đ/lít', region: 'Vùng 1' },
    { label: 'Xăng E5 RON 92-II', price: 19_820, unit: 'đ/lít', region: 'Vùng 1' },
    { label: 'DO 0,05S-II', price: 23_320, unit: 'đ/lít', region: 'Vùng 1' },
  ],
  2: [
    { label: 'Xăng E10 RON 95-V', price: 22_180, unit: 'đ/lít', region: 'Vùng 2' },
    { label: 'Xăng E5 RON 92-II', price: 20_210, unit: 'đ/lít', region: 'Vùng 2' },
    { label: 'DO 0,05S-II', price: 23_780, unit: 'đ/lít', region: 'Vùng 2' },
  ],
};

export function formatVnd(n: number): string {
  return Math.round(n).toLocaleString('vi-VN');
}

export async function loadPetrolRegion(): Promise<PetrolRegion> {
  try {
    const raw = await AsyncStorage.getItem(REGION_KEY);
    return raw === '2' ? 2 : 1;
  } catch {
    return 1;
  }
}

export async function savePetrolRegion(region: PetrolRegion): Promise<void> {
  await AsyncStorage.setItem(REGION_KEY, String(region));
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      url,
      { headers: { Accept: 'application/json, text/plain, */*' } },
      12_000,
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchGold(): Promise<MarketQuote | null> {
  const endpoints = [
    'https://www.vang.today/api/prices?type=SJL1L10',
    'https://giavang.now/api/prices?type=SJL1L10',
  ];
  for (const url of endpoints) {
    const raw = await fetchText(url);
    if (!raw) continue;
    try {
      const json = JSON.parse(raw) as {
        success?: boolean;
        name?: string;
        buy?: number;
        sell?: number;
      };
      if (json.buy && json.sell) {
        return {
          label: json.name ?? 'SJC 9999',
          buy: json.buy,
          sell: json.sell,
          unit: 'đ/lượng',
        };
      }
    } catch {
      // try next
    }
  }
  return null;
}

/** Parse Petrolimex markdown table — col1 = Vùng 1, col2 = Vùng 2. */
function parsePetrolimex(text: string, region: PetrolRegion): MarketQuote[] {
  const rows: MarketQuote[] = [];
  const patterns: { re: RegExp; label: string }[] = [
    { re: /Xăng E10 RON 95-V\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i, label: 'Xăng E10 RON 95-V' },
    { re: /Xăng E5 RON 92-II\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i, label: 'Xăng E5 RON 92-II' },
    { re: /DO 0,05S-II\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i, label: 'DO 0,05S-II' },
    { re: /DO 0,001S-V\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/i, label: 'DO 0,001S-V' },
  ];

  const toNum = (s: string) => Number(s.replace(/\./g, ''));
  const col = region === 1 ? 1 : 2;
  const regionLabel = region === 1 ? 'Vùng 1' : 'Vùng 2';

  for (const { re, label } of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const price = toNum(m[col]);
    if (!Number.isFinite(price) || price < 1000) continue;
    rows.push({
      label,
      price,
      unit: 'đ/lít',
      region: regionLabel,
    });
  }
  return rows;
}

async function fetchPetrol(region: PetrolRegion): Promise<MarketQuote[]> {
  const endpoints = [
    'https://r.jina.ai/http://www.petrolimex.com.vn/',
    'https://r.jina.ai/https://www.petrolimex.com.vn/',
  ];
  for (const url of endpoints) {
    const text = await fetchText(url);
    if (!text) continue;
    const rows = parsePetrolimex(text, region);
    if (rows.length) return rows;
  }
  return [];
}

/** Live SJC + Petrolimex board; falls back offline if blocked. */
export async function fetchMarketBoard(
  region?: PetrolRegion,
): Promise<MarketBoard> {
  const resolved = region ?? (await loadPetrolRegion());
  const [gold, petrol] = await Promise.all([
    fetchGold(),
    fetchPetrol(resolved),
  ]);
  const goldLive = Boolean(gold);
  const petrolLive = petrol.length > 0;
  const isFallback = !goldLive || !petrolLive;

  const now = new Date();
  const updatedLabel = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')} · ${now.getDate()}/${now.getMonth() + 1}`;

  const regionName = resolved === 1 ? 'Vùng 1' : 'Vùng 2';

  return {
    gold: gold ?? GOLD_FALLBACK,
    petrol: petrolLive ? petrol.slice(0, 3) : PETROL_FALLBACK[resolved],
    region: resolved,
    updatedLabel,
    isFallback,
    goldLive,
    petrolLive,
    sourceNote: isFallback
      ? `Offline · ${regionName} · SJC / Petrolimex tham khảo`
      : `SJC live · Petrolimex ${regionName}`,
  };
}
