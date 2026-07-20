import * as Notifications from 'expo-notifications';
import type { SolarDate } from '../lunar/solar';

type OpenFromNotification = (
  data: Record<string, unknown> | undefined,
) => void;

/** Notification tap → open solar day on Hôm nay (giỗ · Rằm/Mùng Một). */
export function bindGioNotificationTap(
  openFromNotification: OpenFromNotification,
): () => void {
  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (!response) return;
      openFromNotification(
        response.notification.request.content.data as Record<string, unknown>,
      );
    })
    .catch(() => {
      // Permission / platform edge cases
    });

  const sub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      openFromNotification(
        response.notification.request.content.data as Record<string, unknown>,
      );
    },
  );

  return () => sub.remove();
}

export type { SolarDate };
