import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let tearSound: AudioPlayer | null = null;
let loading: Promise<void> | null = null;

async function ensureTearSound() {
  if (tearSound) return;
  if (loading) {
    await loading;
    return;
  }
  loading = (async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        allowsRecording: false,
        shouldPlayInBackground: false,
      });
      const player = createAudioPlayer(require('../../assets/sounds/paper-tear.wav'));
      player.volume = 1;
      tearSound = player;
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
  if (Platform.OS === 'web') return;

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 90);
  } catch {
    // no-op
  }

  try {
    await ensureTearSound();
    const sound = tearSound;
    if (!sound) return;
    sound.volume = 1;
    await sound.seekTo(0);
    sound.play();
  } catch {
    tearSound = null;
    loading = null;
  }
}
