import { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { MoodStampPicker } from './MoodStampPicker';
import { loadPageMap, saveMood } from '../lib/localMoods';
import { solarKey } from '../lunar/solar';
import { getVietnamSolarToday } from '../lunar/vietnamTime';
import type { Mood } from '../types/mood';

type Props = {
  fontFamily?: string;
};

/** Mood stamp — lives in Cá nhân, not home hero. */
export function ProfileMoodSection({ fontFamily }: Props) {
  const todayKey = solarKey(getVietnamSolarToday());
  const [moodStamp, setMoodStamp] = useState<Mood | undefined>();

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
    },
    [todayKey],
  );

  return (
    <View style={styles.wrap}>
      <MoodStampPicker
        plain
        selected={moodStamp}
        fontFamily={fontFamily}
        onPick={onPick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
});
