import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState } from 'react-native';
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
  const [today, setToday] = useState(() => getVietnamSolarToday());
  const [hourTick, setHourTick] = useState(0);
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

  useEffect(() => {
    const refresh = () => {
      setToday(getVietnamSolarToday());
      setHourTick((n) => n + 1);
    };
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const id = setInterval(refresh, 60_000);
    return () => {
      sub.remove();
      clearInterval(id);
    };
  }, []);

  const hour = useMemo(
    () => (isSameSolar(selected, today) ? getVietnamHour() : 12),
    [selected, today, hourTick],
  );

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
    async (mood: Mood) => {
      const key = solarKey(selected);
      const prev = records[key];
      setRecords((map) => ({
        ...map,
        [key]: { ...map[key], moodStamp: mood },
      }));
      try {
        await saveMood(key, mood);
      } catch {
        setRecords((map) => ({
          ...map,
          [key]: prev ?? { ...map[key], moodStamp: undefined },
        }));
        Alert.alert('Chưa lưu được', 'Thử đóng dấu lại sau giây lát.');
      }
    },
    [selected, records],
  );

  const setPraiseStamp = useCallback(
    async (praise: Praise, inkSeed: number) => {
      const key = solarKey(selected);
      const prev = records[key];
      setRecords((map) => ({
        ...map,
        [key]: {
          ...map[key],
          praiseStamp: praise,
          praiseInkSeed: inkSeed,
        },
      }));
      try {
        await savePraise(key, praise, inkSeed);
      } catch {
        setRecords((map) => {
          if (!prev) {
            const { praiseStamp: _p, praiseInkSeed: _i, ...rest } =
              map[key] ?? {};
            void _p;
            void _i;
            return { ...map, [key]: rest };
          }
          return { ...map, [key]: prev };
        });
        Alert.alert('Chưa lưu được', 'Thử đóng dấu lại sau giây lát.');
      }
    },
    [selected, records],
  );

  const todayDay = useMemo(() => {
    const solar = today;
    const peekHour = getVietnamHour();
    return getCalendarDayForSolar(solar, peekHour);
  }, [today, hourTick]);

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
