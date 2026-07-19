import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { PraiseStampPicker } from './PraiseStampPicker';
import { resolveFlowerFace } from '../lib/flowerFace';
import { loadPageMap, savePraise } from '../lib/localMoods';
import { stampInkForSkin } from '../lib/stampInk';
import { getCalendarDayForSolar } from '../lunar/today';
import { solarKey } from '../lunar/solar';
import { getVietnamHour, getVietnamSolarToday } from '../lunar/vietnamTime';
import { usePremium } from '../monetization/premium';
import type { Mood, Praise } from '../types/mood';

type Props = {
  fontFamily?: string;
  stampFont?: string;
};

/** Mộc khen ngợi — lives in Cá nhân, not home hero. */
export function ProfilePraiseSection({ fontFamily, stampFont }: Props) {
  const { stampSkin } = usePremium();
  const inkColor = stampInkForSkin(stampSkin);
  const todayKey = solarKey(getVietnamSolarToday());
  const [praiseStamp, setPraiseStamp] = useState<Praise | undefined>();
  const [moodStamp, setMoodStamp] = useState<Mood | undefined>();
  const [inkSeed, setInkSeed] = useState<number | undefined>();
  const [hourTick, setHourTick] = useState(0);

  useEffect(() => {
    let alive = true;
    void loadPageMap().then((map) => {
      if (!alive) return;
      setPraiseStamp(map[todayKey]?.praiseStamp);
      setMoodStamp(map[todayKey]?.moodStamp);
      setInkSeed(map[todayKey]?.praiseInkSeed);
    });
    return () => {
      alive = false;
    };
  }, [todayKey]);

  useEffect(() => {
    const tick = () => setHourTick((n) => n + 1);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });
    const id = setInterval(tick, 60_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  const day = useMemo(() => {
    void hourTick;
    return getCalendarDayForSolar(getVietnamSolarToday(), getVietnamHour());
  }, [hourTick]);

  const flowerFace = resolveFlowerFace(moodStamp, day.dayPathTone);

  const onPick = useCallback(
    async (praise: Praise, seed: number) => {
      setPraiseStamp(praise);
      setInkSeed(seed);
      await savePraise(todayKey, praise, seed);
    },
    [todayKey],
  );

  return (
    <View style={styles.wrap}>
      <PraiseStampPicker
        selected={praiseStamp}
        inkSeed={inkSeed}
        fontFamily={fontFamily}
        stampFont={stampFont}
        face={flowerFace}
        inkColor={inkColor}
        onPick={onPick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 0,
  },
});
