import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMarketBoard,
  formatVnd,
  loadPetrolRegion,
  savePetrolRegion,
  type MarketBoard,
  type PetrolRegion,
} from '../lib/markets';
import { fetchDailyNews, type NewsItem } from '../lib/news';
import {
  loadWidgetPins,
  resetUnpinnedExpanded,
  saveWidgetPins,
  type WidgetId,
  type WidgetPinState,
} from '../lib/widgetPins';
import { usePremium } from '../monetization/premium';
import { colors } from '../theme/tokens';
import { solarKey, type SolarDate } from '../lunar/solar';

type Props = {
  fontFamily?: string;
  calendarDay: SolarDate;
};

export function WidgetTray({ fontFamily, calendarDay }: Props) {
  const { isPremium } = usePremium();
  const [pins, setPins] = useState<WidgetPinState | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [markets, setMarkets] = useState<MarketBoard | null>(null);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const dayKey = solarKey(calendarDay);
  const prevDayRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const state = await loadWidgetPins();
      if (!cancelled) setPins(state);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPremium) {
      prevDayRef.current = dayKey;
      return;
    }
    if (prevDayRef.current === null) {
      prevDayRef.current = dayKey;
      return;
    }
    if (prevDayRef.current === dayKey) return;
    prevDayRef.current = dayKey;
    setPins((prev) => {
      if (!prev) return prev;
      const next = resetUnpinnedExpanded(prev);
      void saveWidgetPins(next);
      return next;
    });
  }, [dayKey, isPremium]);

  useEffect(() => {
    let cancelled = false;
    setNewsLoading(true);
    void (async () => {
      const items = await fetchDailyNews();
      if (!cancelled) {
        setNews(items);
        setNewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMarketsLoading(true);
    void (async () => {
      const board = await fetchMarketBoard();
      if (!cancelled) {
        setMarkets(board);
        setMarketsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRegion = useCallback(async (region: PetrolRegion) => {
    setMarketsLoading(true);
    await savePetrolRegion(region);
    const board = await fetchMarketBoard(region);
    setMarkets(board);
    setMarketsLoading(false);
  }, []);

  const refreshMarkets = useCallback(async () => {
    setMarketsLoading(true);
    const region = markets?.region ?? (await loadPetrolRegion());
    const board = await fetchMarketBoard(region);
    setMarkets(board);
    setMarketsLoading(false);
  }, [markets?.region]);

  const update = useCallback((next: WidgetPinState) => {
    setPins(next);
    void saveWidgetPins(next);
  }, []);

  const toggleExpand = (id: WidgetId) => {
    if (!pins) return;
    update({
      ...pins,
      expanded: { ...pins.expanded, [id]: !pins.expanded[id] },
    });
  };

  const togglePin = (id: WidgetId) => {
    if (!pins) return;
    update({
      ...pins,
      pinned: { ...pins.pinned, [id]: !pins.pinned[id] },
      expanded: { ...pins.expanded, [id]: true },
    });
  };

  if (!pins) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color={colors.crimson} />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <MarketWidget
        fontFamily={fontFamily}
        board={markets}
        loading={marketsLoading}
        expanded={pins.expanded.markets}
        pinned={pins.pinned.markets}
        isPremium={isPremium}
        onToggleExpand={() => toggleExpand('markets')}
        onTogglePin={() => togglePin('markets')}
        onRefresh={() => void refreshMarkets()}
        onRegion={setRegion}
      />
      <NewsWidget
        fontFamily={fontFamily}
        news={news}
        loading={newsLoading}
        expanded={pins.expanded.news}
        pinned={pins.pinned.news}
        isPremium={isPremium}
        onToggleExpand={() => toggleExpand('news')}
        onTogglePin={() => togglePin('news')}
      />
    </View>
  );
}

function MarketWidget({
  fontFamily,
  board,
  loading,
  expanded,
  pinned,
  isPremium,
  onToggleExpand,
  onTogglePin,
  onRefresh,
  onRegion,
}: {
  fontFamily?: string;
  board: MarketBoard | null;
  loading: boolean;
  expanded: boolean;
  pinned: boolean;
  isPremium: boolean;
  onToggleExpand: () => void;
  onTogglePin: () => void;
  onRefresh: () => void;
  onRegion: (r: PetrolRegion) => void;
}) {
  if (!expanded) {
    const goldSell = board?.gold?.sell;
    const ron = board?.petrol[0]?.price;
    const hasPrices = Boolean(goldSell && ron);
    return (
      <Pressable style={styles.strip} onPress={onToggleExpand}>
        <View style={[styles.stripIcon, styles.stripIconGold]}>
          <Ionicons name="trending-up" size={14} color={colors.white} />
        </View>
        <View style={styles.stripBody}>
          <Text style={[styles.stripTitle, fontFamily ? { fontFamily } : null]}>
            Giá vàng · Xăng dầu
          </Text>
          <Text
            style={[styles.stripSub, fontFamily ? { fontFamily } : null]}
            numberOfLines={1}
          >
            {hasPrices
              ? `SJC ${formatVnd(goldSell!)} · RON95 ${formatVnd(ron!)}`
              : 'Chạm để xem giá hôm nay'}
          </Text>
        </View>
        {board?.isFallback ? (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>offline</Text>
          </View>
        ) : null}
        {pinned ? (
          <Ionicons name="pin" size={14} color={colors.goldDeep} />
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.inkFaint} />
        )}
      </Pressable>
    );
  }

  const region = board?.region ?? 1;

  return (
    <View style={styles.card}>
      <View style={[styles.accent, styles.accentGold]} />
      <View style={styles.header}>
        <View style={[styles.iconBadge, styles.stripIconGold]}>
          <Ionicons name="trending-up" size={13} color={colors.white} />
        </View>
        <Text
          style={[styles.title, fontFamily ? { fontFamily } : null, { flex: 1 }]}
        >
          GIÁ VÀNG · XĂNG DẦU
        </Text>
        <Pressable style={styles.iconBtn} onPress={onRefresh} hitSlop={8}>
          <Ionicons name="refresh" size={16} color={colors.inkFaint} />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onTogglePin} hitSlop={8}>
          <Ionicons
            name={pinned ? 'pin' : 'pin-outline'}
            size={16}
            color={pinned ? colors.goldDeep : colors.inkFaint}
          />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onToggleExpand} hitSlop={8}>
          <Ionicons name="chevron-up" size={18} color={colors.inkFaint} />
        </Pressable>
      </View>

      {!isPremium && pinned ? (
        <Text style={styles.pinHint}>
          Ghim trong ngày · Premium giữ bố cục vĩnh viễn
        </Text>
      ) : null}

      {loading || !board ? (
        <ActivityIndicator style={{ marginVertical: 12 }} color={colors.crimson} />
      ) : (
        <>
          {board.isFallback ? (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>
                OFFLINE · giá tham khảo, chạm làm mới khi có mạng
              </Text>
            </View>
          ) : null}

          <Text style={styles.section}>
            VÀNG SJC{board.goldLive ? '' : ' · cache'}
          </Text>
          {board.gold ? (
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>{board.gold.label}</Text>
              <View style={styles.quotePrices}>
                <Text style={styles.buy}>
                  Mua {formatVnd(board.gold.buy ?? 0)}
                </Text>
                <Text style={styles.sell}>
                  Bán {formatVnd(board.gold.sell ?? 0)}
                </Text>
                <Text style={styles.unit}>{board.gold.unit}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.regionRow}>
            <Text style={[styles.section, { marginBottom: 0 }]}>XĂNG DẦU</Text>
            <View style={styles.regionChips}>
              {([1, 2] as PetrolRegion[]).map((r) => (
                <Pressable
                  key={r}
                  style={[styles.regionChip, region === r && styles.regionChipOn]}
                  onPress={() => onRegion(r)}
                >
                  <Text
                    style={[
                      styles.regionChipText,
                      region === r && styles.regionChipTextOn,
                    ]}
                  >
                    Vùng {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          {board.petrol.map((p, i) => (
            <View
              key={p.label}
              style={[styles.petrolRow, i > 0 && styles.itemBorder]}
            >
              <Text style={styles.petrolLabel} numberOfLines={1}>
                {p.label}
              </Text>
              <Text style={styles.petrolPrice}>
                {formatVnd(p.price ?? 0)} {p.unit}
              </Text>
            </View>
          ))}

          <Text style={styles.meta}>
            {board.sourceNote} · {board.updatedLabel}
          </Text>
        </>
      )}
    </View>
  );
}

function NewsWidget({
  fontFamily,
  news,
  loading,
  expanded,
  pinned,
  isPremium,
  onToggleExpand,
  onTogglePin,
}: {
  fontFamily?: string;
  news: NewsItem[];
  loading: boolean;
  expanded: boolean;
  pinned: boolean;
  isPremium: boolean;
  onToggleExpand: () => void;
  onTogglePin: () => void;
}) {
  if (!expanded) {
    return (
      <Pressable style={styles.strip} onPress={onToggleExpand}>
        <View style={styles.stripIcon}>
          <Ionicons name="newspaper" size={14} color={colors.white} />
        </View>
        <Text style={[styles.stripText, fontFamily ? { fontFamily } : null]}>
          TIN MỚI · chạm để mở
        </Text>
        {pinned ? (
          <Ionicons name="pin" size={14} color={colors.goldDeep} />
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.inkFaint} />
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="newspaper" size={13} color={colors.white} />
        </View>
        <Text
          style={[styles.title, fontFamily ? { fontFamily } : null, { flex: 1 }]}
        >
          TIN MỚI TRONG NGÀY
        </Text>
        <Pressable style={styles.iconBtn} onPress={onTogglePin} hitSlop={8}>
          <Ionicons
            name={pinned ? 'pin' : 'pin-outline'}
            size={16}
            color={pinned ? colors.goldDeep : colors.inkFaint}
          />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onToggleExpand} hitSlop={8}>
          <Ionicons name="chevron-up" size={18} color={colors.inkFaint} />
        </Pressable>
      </View>

      {!isPremium && pinned ? (
        <Text style={styles.pinHint}>
          Ghim trong ngày · Premium giữ bố cục vĩnh viễn
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 12 }} color={colors.crimson} />
      ) : (
        news.map((item, i) => (
          <View
            key={`${item.title}-${i}`}
            style={[styles.item, i > 0 && styles.itemBorder]}
          >
            <Text style={styles.itemSource}>{item.source}</Text>
            <Text style={[styles.snippet, fontFamily ? { fontFamily } : null]}>
              {item.title}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.crimson,
  },
  accentGold: {
    backgroundColor: colors.goldDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 2,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: 0.5,
  },
  iconBtn: { padding: 2 },
  pinHint: {
    fontSize: 10,
    color: colors.goldDeep,
    marginBottom: 6,
  },
  section: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  offlineBanner: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#E8D5A3',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDeep,
  },
  regionRow: {
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  regionChips: { flexDirection: 'row', gap: 6 },
  regionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.paper,
  },
  regionChipOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF1F2',
  },
  regionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  regionChipTextOn: {
    color: colors.crimson,
  },
  quoteRow: {
    paddingVertical: 6,
  },
  quoteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  quotePrices: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'baseline',
  },
  buy: { fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
  sell: { fontSize: 13, color: colors.goldDeep, fontWeight: '800' },
  unit: { fontSize: 10, color: colors.inkFaint },
  petrolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 7,
  },
  petrolLabel: { flex: 1, fontSize: 12, color: colors.inkMuted },
  petrolPrice: { fontSize: 12, fontWeight: '800', color: colors.ink },
  meta: {
    marginTop: 8,
    fontSize: 10,
    color: colors.inkFaint,
  },
  item: { paddingVertical: 8 },
  itemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  itemSource: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.crimson,
    marginBottom: 2,
  },
  snippet: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stripIcon: {
    width: 26,
    height: 26,
    borderRadius: 2,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripIconGold: {
    backgroundColor: colors.goldDeep,
  },
  stripBody: {
    flex: 1,
    minWidth: 0,
  },
  stripTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ink,
  },
  stripSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkMuted,
  },
  offlineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: colors.paperDeep,
  },
  offlineBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkFaint,
    textTransform: 'lowercase',
  },
  stripText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
});
