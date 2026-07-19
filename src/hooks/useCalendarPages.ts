import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCalendarDayForSolar } from '../lunar/today';
import {
  addSolarDays,
  isSameSolar,
  solarKey,
  type SolarDate,
} from '../lunar/solar';
import { getVietnamHour, getVietnamSolarToday } from '../lunar/vietnamTime';
import { loadPageMap, saveMood, savePraise } from '../lib/localMoods';
import type { DatePageRecord, Mood, Praise } from '../types/mood';

export type { DatePageRecord, Mood, Praise };

type Options = {
  selected: SolarDate;
  onChangeSelected: (d: SolarDate) => void;
};

export function useCalendarPages({ selected, onChangeSelected }: Options) {
  const today = useMemo(() => getVietnamSolarToday(), []);
  const [records, setRecords] = useState<Record<string, DatePageRecord>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const map = await loadPageMap();
      if (cancelled) return;
      setRecords(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hour = isSameSolar(selected, today) ? getVietnamHour() : 12;

  const currentDay = useMemo(
    () => getCalendarDayForSolar(selected, hour),
    [selected, hour],
  );

  const peekDay = useCallback(
    (direction: 'next' | 'prev') => {
      const solar = addSolarDays(selected, direction === 'next' ? 1 : -1);
      const peekHour = isSameSolar(solar, today) ? getVietnamHour() : 12;
      return getCalendarDayForSolar(solar, peekHour);
    },
    [selected, today],
  );

  const goBy = useCallback(
    (delta: number) => {
      onChangeSelected(addSolarDays(selected, delta));
    },
    [onChangeSelected, selected],
  );

  const goToday = useCallback(() => {
    onChangeSelected(getVietnamSolarToday());
  }, [onChangeSelected]);

  const pageRecord = records[solarKey(selected)];

  const setMoodStamp = useCallback(
    (mood: Mood) => {
      const key = solarKey(selected);
      setRecords((prev) => ({
        ...prev,
        [key]: { ...prev[key], moodStamp: mood },
      }));
      void saveMood(key, mood);
    },
    [selected],
  );

  const setPraiseStamp = useCallback(
    (praise: Praise, inkSeed: number) => {
      const key = solarKey(selected);
      setRecords((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          praiseStamp: praise,
          praiseInkSeed: inkSeed,
        },
      }));
      void savePraise(key, praise, inkSeed);
    },
    [selected],
  );

  const todayDay = useMemo(() => {
    const solar = getVietnamSolarToday();
    const peekHour = getVietnamHour();
    return getCalendarDayForSolar(solar, peekHour);
  }, []);

  return {
    today,
    todayDay,
    selected,
    selectedKey: solarKey(selected),
    currentDay,
    peekDay,
    pageRecord,
    isToday: isSameSolar(selected, today),
    goNext: () => goBy(1),
    goPrev: () => goBy(-1),
    goToday,
    setMoodStamp,
    setPraiseStamp,
  };
}
