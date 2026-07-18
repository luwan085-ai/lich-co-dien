import { useCallback, useMemo, useState } from 'react';
import { getCalendarDayForSolar } from '../lunar/today';
import {
  addSolarDays,
  isSameSolar,
  solarKey,
  type SolarDate,
} from '../lunar/solar';
import { getVietnamHour, getVietnamSolarToday } from '../lunar/vietnamTime';

/** Per-date user data (stamps etc.) — local for now, Supabase in W4. */
export type DatePageRecord = {
  moodStamp?: 'happy' | 'calm' | 'angry' | 'sad' | 'jackpot';
};

export function useCalendarPages(initial?: SolarDate) {
  const today = useMemo(() => getVietnamSolarToday(), []);
  const [selected, setSelected] = useState<SolarDate>(initial ?? today);
  const [records, setRecords] = useState<Record<string, DatePageRecord>>({});

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

  const goBy = useCallback((delta: number) => {
    setSelected((prev) => addSolarDays(prev, delta));
  }, []);

  const goToday = useCallback(() => {
    setSelected(getVietnamSolarToday());
  }, []);

  const pageRecord = records[solarKey(selected)];

  const setMoodStamp = useCallback(
    (mood: DatePageRecord['moodStamp']) => {
      const key = solarKey(selected);
      setRecords((prev) => ({
        ...prev,
        [key]: { ...prev[key], moodStamp: mood },
      }));
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
    currentDay,
    peekDay,
    pageRecord,
    isToday: isSameSolar(selected, today),
    goNext: () => goBy(1),
    goPrev: () => goBy(-1),
    goToday,
    setMoodStamp,
  };
}
