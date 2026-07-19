import { Pedometer } from 'expo-sensors';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_KEY = 'lich_steps_demo_v1';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export type StepsSource = 'pedometer' | 'demo' | 'unavailable';

export function useSteps() {
  const [steps, setSteps] = useState(0);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<StepsSource>('demo');
  const goal = 8000;
  const rewardAt = 1000;

  const persistDemo = useCallback(async (next: number) => {
    setSteps(next);
    await AsyncStorage.setItem(
      DEMO_KEY,
      JSON.stringify({ date: todayKey(), steps: next }),
    );
  }, []);

  useEffect(() => {
    let alive = true;
    let sub: { remove: () => void } | null = null;

    void (async () => {
      try {
        if (Platform.OS === 'web') {
          throw new Error('web');
        }
        const available = await Pedometer.isAvailableAsync();
        if (!available) throw new Error('unavailable');

        const permission = await Pedometer.requestPermissionsAsync();
        if (!permission.granted) throw new Error('denied');

        const result = await Pedometer.getStepCountAsync(
          startOfToday(),
          new Date(),
        );
        if (!alive) return;
        setSteps(result.steps);
        setSource('pedometer');

        sub = Pedometer.watchStepCount((event) => {
          // watchStepCount often gives session delta — refresh absolute for today
          void Pedometer.getStepCountAsync(startOfToday(), new Date()).then(
            (r) => {
              if (alive) setSteps(r.steps);
            },
          );
          if (alive && event.steps > 0) {
            // keep latest if absolute fetch fails on some devices
            setSteps((prev) => Math.max(prev, event.steps));
          }
        });
      } catch {
        try {
          const raw = await AsyncStorage.getItem(DEMO_KEY);
          if (raw && alive) {
            const parsed = JSON.parse(raw) as { date: string; steps: number };
            if (parsed.date === todayKey()) setSteps(parsed.steps);
          }
        } catch {
          // no-op
        }
        if (alive) {
          setSource(Platform.OS === 'web' ? 'demo' : 'unavailable');
        }
      } finally {
        if (alive) setReady(true);
      }
    })();

    return () => {
      alive = false;
      sub?.remove();
    };
  }, []);

  const addSteps = useCallback(
    (delta: number) => {
      if (source === 'pedometer') return;
      void persistDemo(Math.max(0, steps + delta));
    },
    [persistDemo, source, steps],
  );

  const reset = useCallback(() => {
    if (source === 'pedometer') return;
    void persistDemo(0);
  }, [persistDemo, source]);

  return {
    steps,
    goal,
    rewardAt,
    ready,
    source,
    progress: Math.min(1, steps / goal),
    rewardReady: steps >= rewardAt,
    addSteps,
    reset,
    isLive: source === 'pedometer',
  };
}
