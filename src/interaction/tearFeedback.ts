import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let tearSound: Audio.Sound | null = null;
let loading: Promise<void> | null = null;

async function ensureTearSound() {
  if (tearSound) return;
  if (loading) {
    await loading;
    return;
  }
  loading = (async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/paper-tear.wav'),
        { shouldPlay: false, volume: 1, isLooping: false },
      );
      tearSound = sound;
    } catch {
      tearSound = null;
    } finally {
      loading = null;
    }
  })();
  await loading;
}

/** Prefetch on first mount so swipe/chip feel instant. */
export function preloadTearSound() {
  void ensureTearSound();
}

export async function hapticTearTick() {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // no-op
  }
}

/** Commit tear: impact + paper rustle. */
export async function playTearFeedback() {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 90);
    } catch {
      // no-op
    }
  }

  try {
    await ensureTearSound();
    const sound = tearSound;
    if (!sound) return;
    await sound.stopAsync().catch(() => undefined);
    await sound.setPositionAsync(0);
    await sound.setVolumeAsync(1);
    await sound.playAsync();
  } catch {
    tearSound = null;
    loading = null;
  }
}
