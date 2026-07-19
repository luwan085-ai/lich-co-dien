import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'lich_steps_demo_v1';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useDemoSteps() {
  const [steps, setSteps] = useState(0);
  const [ready, setReady] = useState(false);
  const goal = 8000;
  const rewardAt = 1000;

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { date: string; steps: number };
          if (parsed.date === todayKey() && alive) {
            setSteps(parsed.steps);
          }
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback(async (next: number) => {
    setSteps(next);
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ date: todayKey(), steps: next }),
    );
  }, []);

  const addSteps = useCallback(
    (delta: number) => {
      void persist(Math.max(0, steps + delta));
    },
    [persist, steps],
  );

  const reset = useCallback(() => {
    void persist(0);
  }, [persist]);

  return {
    steps,
    goal,
    rewardAt,
    ready,
    progress: Math.min(1, steps / goal),
    rewardReady: steps >= rewardAt,
    addSteps,
    reset,
  };
}
