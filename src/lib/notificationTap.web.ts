/** Web stub — notification response APIs are native-only. */
export function bindGioNotificationTap(
  _openFromNotification: (
    data: Record<string, unknown> | undefined,
  ) => void,
): () => void {
  return () => {};
}
