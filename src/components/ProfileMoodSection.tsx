import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { MoodStampPicker } from './MoodStampPicker';
import { loadPageMap, saveMood } from '../lib/localMoods';
import { solarKey } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import { MOOD_STAMPS, type Mood } from '../types/mood';
import { colors } from '../theme/tokens';

type Props = {
  fontFamily?: string;
};

/** Compact mood stamp — summary row, expand to pick. */
export function ProfileMoodSection({ fontFamily }: Props) {
  const todayKey = solarKey(getVietnamSolarToday());
  const [moodStamp, setMoodStamp] = useState<Mood | undefined>();
  const [open, setOpen] = useState(false);

  const reload = useCallback(() => {
    void loadPageMap().then((map) => {
      setMoodStamp(map[todayKey]?.moodStamp);
    });
  }, [todayKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') reload();
    });
    return () => sub.remove();
  }, [reload]);

  const onPick = useCallback(
    async (mood: Mood) => {
      setMoodStamp(mood);
      await saveMood(todayKey, mood);
      setOpen(false);
    },
    [todayKey],
  );

  const active = MOOD_STAMPS.find((m) => m.id === moodStamp);
  const summary = active
    ? `Hôm nay: ${active.labelVi} (${active.char}) · chạm để đổi`
    : 'Chưa đóng dấu · chạm để chọn cảm xúc';

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.summaryRow}
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text style={[styles.summary, fontFamily ? { fontFamily } : null]}>
          {summary}
        </Text>
        <Text style={styles.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? (
        <MoodStampPicker
          plain
          compact
          selected={moodStamp}
          fontFamily={fontFamily}
          onPick={onPick}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
  },
  summary: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    lineHeight: 20,
  },
  chev: {
    fontSize: 14,
    color: colors.inkFaint,
  },
});
