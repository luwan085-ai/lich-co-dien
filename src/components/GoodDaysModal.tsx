import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  findGoodDaysForPurpose,
  PURPOSE_LIST,
  type GoodDayPurpose,
  type RecommendedGoodDay,
} from '../lib/goodDays';
import type { SolarDate } from '../lunar/solar';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (solar: SolarDate) => void;
  fontFamily?: string;
  displayFont?: string;
};

export function GoodDaysModal({
  visible,
  onClose,
  onSelectDay,
  fontFamily,
  displayFont,
}: Props) {
  const [selectedPurpose, setSelectedPurpose] =
    useState<GoodDayPurpose>('khai_truong');

  if (!visible) return null;

  const currentMeta =
    PURPOSE_LIST.find((p) => p.id === selectedPurpose) ?? PURPOSE_LIST[0]!;
  const goodDays: RecommendedGoodDay[] =
    findGoodDaysForPurpose(selectedPurpose);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
            XEM NGÀY TỐT CÁT LÀNH
          </Text>
          <Text
            style={[
              styles.title,
              displayFont ? { fontFamily: displayFont } : null,
            ]}
          >
            Chọn ngày đẹp theo mục đích
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
          >
            {PURPOSE_LIST.map((p) => {
              const active = p.id === selectedPurpose;
              return (
                <Pressable
                  key={p.id}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => setSelectedPurpose(p.id)}
                >
                  <Text style={styles.tabIcon}>{p.icon}</Text>
                  <Text
                    style={[
                      styles.tabText,
                      active && styles.tabTextActive,
                      fontFamily ? { fontFamily } : null,
                    ]}
                  >
                    {p.shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.descBox}>
            <Text style={styles.descText}>{currentMeta.description}</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
          >
            {goodDays.length === 0 ? (
              <Text style={styles.emptyText}>
                Không tìm thấy ngày phù hợp trong 60 ngày tới.
              </Text>
            ) : (
              goodDays.map((item) => (
                <Pressable
                  key={item.dateKey}
                  style={styles.dayCard}
                  onPress={() => {
                    onSelectDay(item.solar);
                    onClose();
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.ddayText}>
                        {item.daysUntil === 0
                          ? 'Hôm nay'
                          : `Còn ${item.daysUntil} ngày`}
                      </Text>
                    </View>
                    <Text style={styles.lunarBadge}>{item.lunarLabel}</Text>
                  </View>

                  <Text
                    style={[
                      styles.solarDateText,
                      fontFamily ? { fontFamily } : null,
                    ]}
                  >
                    {item.dayOfWeekLabel}, ngày {item.solar.day}/
                    {item.solar.month}/{item.solar.year}
                  </Text>

                  <Text style={styles.reasonText}>✨ {item.matchedReason}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 20, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.inkMuted,
    fontWeight: '700',
  },
  kicker: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 4,
    marginBottom: 12,
  },
  tabsScroll: {
    maxHeight: 44,
    marginBottom: 10,
  },
  tabsContent: {
    paddingRight: 10,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: colors.crimson,
    borderColor: colors.crimson,
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tabText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  descBox: {
    backgroundColor: colors.paperDeep,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  descText: {
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  listScroll: {
    maxHeight: 340,
  },
  listContent: {
    paddingBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.inkFaint,
    marginTop: 20,
    fontSize: 13,
  },
  dayCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ddayText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
  },
  lunarBadge: {
    fontSize: 12,
    color: colors.crimson,
    fontWeight: '700',
  },
  solarDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: colors.inkMuted,
  },
});
