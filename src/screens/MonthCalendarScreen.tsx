import { useEffect, useMemo, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MonthSelectedDayCard } from '../components/MonthSelectedDayCard';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { loadMemoMap, annivKindOnLunar, type DayMemo } from '../lib/localMemos';
import { loadLastVisit, markVisitToday } from '../lib/visits';
import { getMonthGrid } from '../lunar/today';
import { isSameSolar, solarKey, type SolarDate } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import type { DayQualityTone } from '../lunar/today';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  displayFont?: string;
  selected?: SolarDate;
  memoRefreshKey?: number;
  onSelectDay: (day: SolarDate) => void;
  onOpenDay: (day: SolarDate) => void;
};

const WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DOT: Record<DayQualityTone, string> = {
  great: colors.crimson,
  good: colors.crimsonSoft,
  neutral: colors.inkFaint,
  poor: '#C9A227',
  bad: '#5C2E2E',
};

export function MonthCalendarScreen({
  fontFamily,
  displayFont,
  selected,
  memoRefreshKey = 0,
  onSelectDay,
  onOpenDay,
}: Props) {
  const [today, setToday] = useState(() => getVietnamSolarToday());
  const todayKey = solarKey(today);
  const [cursor, setCursor] = useState({
    year: selected?.year ?? today.year,
    month: selected?.month ?? today.month,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [memos, setMemos] = useState<Record<string, DayMemo>>({});
  const [missedDays, setMissedDays] = useState(0);
  const [picked, setPicked] = useState<SolarDate>(
    () => selected ?? today,
  );

  useEffect(() => {
    if (selected) setPicked(selected);
  }, [selected?.year, selected?.month, selected?.day]);

  useEffect(() => {
    const refresh = () => setToday(getVietnamSolarToday());
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    const id = setInterval(refresh, 60_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const map = await loadMemoMap();
      if (alive) setMemos(map);
    })();
    return () => {
      alive = false;
    };
  }, [cursor.year, cursor.month, selected?.day, selected?.month, selected?.year, memoRefreshKey]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const last = await loadLastVisit();
        if (!alive) return;
        if (last?.dateKey && last.dateKey !== todayKey) {
          const [ly, lm, ld] = last.dateKey.split('-').map(Number);
          const prev = new Date(ly, lm - 1, ld);
          const now = new Date(today.year, today.month - 1, today.day);
          const diff = Math.round(
            (now.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000),
          );
          setMissedDays(diff > 0 ? diff : 0);
        } else {
          setMissedDays(0);
        }
        await markVisitToday(todayKey);
      } catch {
        if (alive) setMissedDays(0);
      }
    })();
    return () => {
      alive = false;
    };
  }, [todayKey, today.year, today.month, today.day]);

  const grid = useMemo(
    () => getMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const shift = (delta: number) => {
    setCursor((prev) => {
      const d = new Date(Date.UTC(prev.year, prev.month - 1 + delta, 1, 12));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
    });
  };

  const handlePick = (day: SolarDate) => {
    setPicked(day);
    onSelectDay(day);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={() => shift(-1)}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Pressable
          style={styles.titleBlock}
          onPress={() => setPickerOpen(true)}
        >
          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            LỊCH THÁNG · CHẠM NGÀY ĐỂ XEM
          </Text>
          <Text
            style={[
              styles.title,
              displayFont ? { fontFamily: displayFont } : null,
            ]}
          >
            Tháng {cursor.month}-{cursor.year} ▾
          </Text>
        </Pressable>
        <Pressable style={styles.navBtn} onPress={() => shift(1)}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {missedDays >= 2 ? (
        <Pressable
          style={styles.welcomeBack}
          onPress={() => handlePick(today)}
        >
          <Text style={styles.welcomeTitle}>Chào bạn quay lại</Text>
          <Text style={styles.welcomeBody}>
            Đã {missedDays} ngày · chạm để xem hôm nay
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.weekRow}>
        {WEEK.map((w) => (
          <Text key={w} style={styles.weekLabel}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.cells.map((cell, idx) => {
          if (!cell) {
            return <View key={`e-${idx}`} style={styles.cell} />;
          }
          const key = solarKey(cell.solar);
          const memo = memos[key];
          const hasMemo = Boolean(memo?.text) && !memo?.isAnniversary;
          const lunarAnniv = {
            month: cell.lunarMonth,
            day: cell.lunarDay,
            leapMonth: cell.leapMonth,
          };
          const annivKind = annivKindOnLunar(memos, lunarAnniv);
          const isSelected = isSameSolar(picked, cell.solar);
          return (
            <Pressable
              key={key}
              style={[
                styles.cell,
                cell.isToday && styles.cellToday,
                isSelected && styles.cellSelected,
              ]}
              onPress={() => handlePick(cell.solar)}
            >
              {annivKind === 'gio' ? <View style={styles.gioStripe} /> : null}
              <Text
                style={[
                  styles.solarDay,
                  cell.isToday && styles.solarDayToday,
                  isSelected && styles.solarDaySelected,
                ]}
              >
                {cell.solar.day}
              </Text>
              <Text style={styles.lunarDay}>{cell.lunarDay}</Text>
              <View style={styles.marks}>
                <View
                  style={[styles.dot, { backgroundColor: DOT[cell.tone] }]}
                />
                {annivKind === 'birthday' ? (
                  <Text style={styles.birthdayStar}>★</Text>
                ) : null}
                {hasMemo ? <View style={styles.memoDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendDot color={DOT.great} label="Hoàng / Cát" />
        <LegendDot color={DOT.neutral} label="Bình" />
        <LegendBar label="Giỗ âm" />
        <LegendStar label="Sinh nhật" />
      </View>

      <MonthSelectedDayCard
        selected={picked}
        memos={memos}
        fontFamily={fontFamily}
        displayFont={displayFont}
        onOpenDay={onOpenDay}
      />

      <MonthYearPicker
        visible={pickerOpen}
        year={cursor.year}
        month={cursor.month}
        fontFamily={fontFamily}
        onClose={() => setPickerOpen(false)}
        onConfirm={(year, month) => {
          setCursor({ year, month });
        }}
      />
    </ScrollView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function LegendBar({ label }: { label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={styles.legendBar} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function LegendStar({ label }: { label: string }) {
  return (
    <View style={styles.legendItem}>
      <Text style={styles.legendStarIcon}>★</Text>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.page,
    paddingTop: 14,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  navText: {
    fontSize: 22,
    color: colors.crimson,
    lineHeight: 24,
  },
  titleBlock: { alignItems: 'center', paddingHorizontal: 8 },
  kicker: {
    color: colors.crimson,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  welcomeBack: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#E8D5A3',
  },
  welcomeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.goldDeep,
  },
  welcomeBody: {
    marginTop: 2,
    fontSize: 12,
    color: colors.inkMuted,
  },
  weekRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 6,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkFaint,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  cellToday: {
    backgroundColor: '#FFF1F2',
  },
  cellSelected: {
    backgroundColor: '#F3E6C8',
    borderWidth: 1,
    borderColor: colors.goldDeep,
  },
  gioStripe: {
    position: 'absolute',
    left: 0,
    top: 5,
    bottom: 5,
    width: 3,
    backgroundColor: colors.crimson,
  },
  solarDay: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  solarDayToday: {
    color: colors.crimson,
  },
  solarDaySelected: {
    color: colors.goldDeep,
  },
  lunarDay: {
    marginTop: 2,
    fontSize: 10,
    color: colors.inkMuted,
  },
  marks: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 12,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  memoDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.inkFaint,
  },
  birthdayStar: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    color: colors.goldDeep,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendBar: {
    width: 3,
    height: 10,
    backgroundColor: colors.crimson,
  },
  legendStarIcon: {
    fontSize: 9,
    lineHeight: 10,
    color: colors.goldDeep,
    fontWeight: '800',
  },
  legendText: { fontSize: 9, color: colors.inkFaint, fontWeight: '600' },
});
