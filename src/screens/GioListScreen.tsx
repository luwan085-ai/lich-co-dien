import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  dDayLabel,
  formatSolarShort,
  listUpcomingGio,
  type GioOccurrence,
} from '../lib/gioSchedule';
import { loadMemoMap } from '../lib/localMemos';
import type { SolarDate } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  displayFont?: string;
  onBack?: () => void;
  onSelectDay: (day: SolarDate) => void;
};

export function GioListScreen({
  fontFamily,
  displayFont,
  onBack,
  onSelectDay,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GioOccurrence[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const map = await loadMemoMap();
      const upcoming = listUpcomingGio(map, getVietnamSolarToday());
      setItems(upcoming);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack}>
          <Text style={styles.backText}>‹ Cá nhân</Text>
        </Pressable>
      ) : null}

      <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
        GIỖ & SINH NHẬT ÂM
      </Text>
      <Text style={[styles.title, displayFont ? { fontFamily: displayFont } : null]}>
        Danh sách giỗ & sinh nhật
      </Text>
      <Text style={styles.sub}>
        Sắp xếp theo ngày dương tiếp theo · chạm để mở tờ lịch ngày đó.
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.crimson} style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Chưa có giỗ hoặc sinh nhật âm</Text>
          <Text style={styles.emptyLine}>
            Vào Hôm nay → Ghi chú / Giỗ lễ → chọn Giỗ âm hoặc Sinh nhật âm.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => {
            const isBirthday = item.annivKind === 'birthday';
            return (
            <Pressable
              key={`${item.lunarLabel}-${item.solar.year}-${item.solar.month}-${item.solar.day}`}
              style={styles.row}
              onPress={() => onSelectDay(item.solar)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}, ${dDayLabel(item.daysUntil)}`}
            >
              <View style={styles.rowTop}>
                <View style={styles.rowLabelWrap}>
                  <Text
                    style={[styles.kindBadge, isBirthday && styles.kindBirthday]}
                  >
                    {isBirthday ? 'Sinh nhật' : 'Giỗ'}
                  </Text>
                  <Text
                    style={[styles.rowLabel, fontFamily ? { fontFamily } : null]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
                <Text style={[styles.dday, item.daysUntil === 0 && styles.ddayToday]}>
                  {dDayLabel(item.daysUntil)}
                </Text>
              </View>
              <Text style={styles.lunar}>{item.lunarLabel}</Text>
              <Text style={styles.solar}>
                Lần tới {formatSolarShort(item.solar)} dương
              </Text>
            </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: 8,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 4,
  },
  backText: {
    color: colors.crimson,
    fontWeight: '700',
    fontSize: 14,
  },
  kicker: {
    color: colors.crimson,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: 12,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  emptyTitle: {
    fontWeight: '800',
    color: colors.ink,
    fontSize: 14,
    marginBottom: 6,
  },
  emptyLine: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    padding: 14,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  kindBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.crimsonDeep,
    borderWidth: 1,
    borderColor: colors.crimsonSoft,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: '#FFF1F2',
  },
  kindBirthday: {
    color: '#8F7328',
    borderColor: colors.goldSoft,
    backgroundColor: '#FFF8E7',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  dday: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.crimsonDeep,
  },
  ddayToday: {
    color: colors.crimson,
  },
  lunar: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.crimson,
  },
  solar: {
    marginTop: 4,
    fontSize: 11,
    color: colors.inkMuted,
  },
});
