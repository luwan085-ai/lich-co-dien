import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSteps } from '../hooks/useSteps';
import { colors, spacing } from '../theme/tokens';

type Props = {
  fontFamily?: string;
  displayFont?: string;
  onBack?: () => void;
};

export function StepsScreen({ fontFamily, displayFont, onBack }: Props) {
  const {
    steps,
    goal,
    rewardAt,
    progress,
    rewardReady,
    addSteps,
    reset,
    isLive,
    source,
    ready,
  } = useSteps();

  const sourceLabel =
    source === 'pedometer'
      ? 'Pedometer (máy) · cập nhật theo thời gian thực'
      : source === 'unavailable'
        ? 'Máy không hỗ trợ / chưa cấp quyền · đang dùng chế độ demo'
        : 'Web / demo · dùng nút +100 / +500 để thử';

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable style={styles.back} onPress={onBack}>
          <Text style={styles.backText}>‹ Cá nhân</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.kicker, fontFamily ? { fontFamily } : null]}>
        BƯỚC CHÂN HÔM NAY
      </Text>
      <Text
        style={[styles.steps, displayFont ? { fontFamily: displayFont } : null]}
      >
        {ready ? steps.toLocaleString('vi-VN') : '—'}
      </Text>
      <Text style={styles.goal}>Mục tiêu {goal.toLocaleString('vi-VN')} bước</Text>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={[styles.reward, rewardReady && styles.rewardOn]}>
        <Text style={styles.rewardTitle}>
          {rewardReady
            ? 'Túi may mắn đã sẵn sàng'
            : `Còn ${Math.max(0, rewardAt - steps)} bước tới túi may mắn`}
        </Text>
        <Text style={styles.rewardSub}>
          {rewardReady
            ? 'Chạm để nhận thưởng (sau này gắn quảng cáo 30s)'
            : `Mốc thưởng: ${rewardAt.toLocaleString('vi-VN')} bước`}
        </Text>
        {rewardReady ? (
          <Pressable style={styles.rewardBtn}>
            <Text style={styles.rewardBtnText}>Mở túi may mắn</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.demoNote}>{sourceLabel}</Text>

      {!isLive ? (
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={() => addSteps(100)}>
            <Text style={styles.actionText}>+100</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={() => addSteps(500)}>
            <Text style={styles.actionText}>+500</Text>
          </Pressable>
          <Pressable style={[styles.action, styles.actionGhost]} onPress={reset}>
            <Text style={[styles.actionText, styles.actionGhostText]}>Reset</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: spacing.page,
    paddingTop: 20,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  backText: {
    color: colors.crimson,
    fontSize: 13,
    fontWeight: '700',
  },
  kicker: {
    color: colors.crimson,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  steps: {
    marginTop: 10,
    fontSize: 64,
    lineHeight: 72,
    color: colors.ink,
    fontWeight: '700',
  },
  goal: {
    color: colors.inkMuted,
    fontSize: 13,
  },
  barTrack: {
    marginTop: 18,
    height: 10,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.crimson,
  },
  reward: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  rewardOn: {
    borderColor: colors.crimson,
    backgroundColor: '#FFF5F5',
  },
  rewardTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  rewardSub: {
    marginTop: 6,
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  rewardBtn: {
    marginTop: 12,
    backgroundColor: colors.crimson,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rewardBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  demoNote: {
    marginTop: 16,
    color: colors.inkFaint,
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  action: {
    flex: 1,
    backgroundColor: colors.lacquer,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    color: colors.white,
    fontWeight: '800',
  },
  actionGhost: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionGhostText: {
    color: colors.inkMuted,
  },
});
