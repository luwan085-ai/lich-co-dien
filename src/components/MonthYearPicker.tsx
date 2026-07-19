import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = {
  visible: boolean;
  year: number;
  month: number;
  onClose: () => void;
  onConfirm: (year: number, month: number) => void;
  fontFamily?: string;
};

const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

export function MonthYearPicker({
  visible,
  year,
  month,
  onClose,
  onConfirm,
  fontFamily,
}: Props) {
  const years = Array.from({ length: 21 }, (_, i) => year - 10 + i);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
            CHỌN THÁNG / NĂM
          </Text>

          <Text style={styles.section}>Năm</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearRow}
          >
            {years.map((y) => (
              <Pressable
                key={y}
                style={[styles.pill, y === year && styles.pillOn]}
                onPress={() => onConfirm(y, month)}
              >
                <Text style={[styles.pillText, y === year && styles.pillTextOn]}>
                  {y}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.section}>Tháng</Text>
          <View style={styles.monthGrid}>
            {MONTHS.map((label, idx) => {
              const m = idx + 1;
              const on = m === month;
              return (
                <Pressable
                  key={label}
                  style={[styles.monthCell, on && styles.monthCellOn]}
                  onPress={() => {
                    onConfirm(year, m);
                    onClose();
                  }}
                >
                  <Text style={[styles.monthText, on && styles.monthTextOn]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,26,23,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 3,
    borderTopColor: colors.crimson,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.crimson,
    letterSpacing: 0.8,
  },
  section: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '700',
    color: colors.inkMuted,
  },
  yearRow: {
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  pillOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF1F2',
  },
  pillText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  pillTextOn: {
    color: colors.crimson,
    fontWeight: '800',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthCell: {
    width: '30%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  monthCellOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF1F2',
  },
  monthText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  monthTextOn: {
    color: colors.crimson,
    fontWeight: '800',
  },
  closeBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    fontWeight: '700',
    color: colors.inkMuted,
  },
});
