import type { DayQualityTone } from '../lunar/today';
import type { Mood } from '../types/mood';
import type { FlowerFace } from '../components/HoaBeNgoan';

/**
 * Happy face when the day feels good; sad face when average / bad.
 * Mood stamp wins if set; else lunar day tone.
 */
export function resolveFlowerFace(
  mood?: Mood,
  dayTone?: DayQualityTone,
): FlowerFace {
  if (mood === 'happy' || mood === 'calm' || mood === 'jackpot') {
    return 'happy';
  }
  if (mood === 'sad' || mood === 'angry') {
    return 'sad';
  }
  if (dayTone === 'great' || dayTone === 'good') {
    return 'happy';
  }
  // neutral / poor / bad / unknown → 보통·별로
  return 'sad';
}
