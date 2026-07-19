import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export async function shareCapturedView(
  ref: RefObject<View | null>,
  message: string,
): Promise<boolean> {
  if (!ref.current) return false;

  try {
    if (Platform.OS === 'web') {
      await Share.share({ message });
      return true;
    }

    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    const can = await Sharing.isAvailableAsync();
    if (can) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Chia sẻ lịch',
        UTI: 'public.png',
      });
      return true;
    }

    await Share.share({ message, url: uri });
    return true;
  } catch {
    try {
      await Share.share({ message });
      return true;
    } catch {
      return false;
    }
  }
}
