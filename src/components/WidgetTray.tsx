import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

export function WidgetTray({ fontFamily }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="newspaper" size={13} color={colors.white} />
        </View>
        <Text style={[styles.title, fontFamily ? { fontFamily } : null]}>
          TIN MỚI TRONG NGÀY
        </Text>
      </View>
      <Text style={[styles.snippet, fontFamily ? { fontFamily } : null]}>
        Hồ Chí Minh: Thời tiết đẹp thuận lợi cho các hoạt động ngoài trời…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.crimson,
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
  snippet: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
  },
});
