// ─────────────────────────────────────────────────────────────
// ローカル通知サービス（expo-notifications）
//
// 旅程から生成したリマインドを端末のローカル通知として登録します。
//
// 注意:
//   ・iOS のローカル通知は同時に最大 64 件まで。先のものから 64 件登録し、
//     アプリ起動／更新のたびに全消去→再登録します。
//   ・通知無効の旅程は buildReminders 側で除外済み（ここには来ません）。
//   ・Web では通知を登録しません。
// ─────────────────────────────────────────────────────────────
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { Preferences, Trip } from '@/types';
import { allReminders } from '@/features/itinerary/buildReminders';

/** iOS のローカル通知上限。 */
const MAX_SCHEDULED = 64;

// 受信時の表示挙動（フォアグラウンドでもバナー表示）。
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 通知の許可をリクエストします（初回のみダイアログ表示）。
 * @returns 許可されたら true。
 */
export async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // Android はチャンネル登録が必要。
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '旅程リマインド',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  // 実機のみ許可が意味を持つ（シミュレータ/Web ではスキップ）。
  if (!Device.isDevice) return false;

  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

/**
 * すべての旅程の通知を再同期します（全消去 → 先 64 件を再登録）。
 * @returns 実際に登録した件数。
 */
export async function syncScheduledNotifications(trips: Trip[], prefs: Preferences): Promise<number> {
  if (Platform.OS === 'web') return 0;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    return 0;
  }

  const now = Date.now();
  const upcoming = allReminders(trips, prefs.notifications)
    .filter((r) => r.when.getTime() > now)
    .slice(0, MAX_SCHEDULED);

  for (const r of upcoming) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: r.label,
          body: r.sub ? `${r.sub} · ${r.tripTitle}` : r.tripTitle,
          data: { tripId: r.tripId, kind: r.kind },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: r.when,
        },
      });
    } catch {
      // 個別の失敗は無視して続行（権限なし等）。
    }
  }

  return upcoming.length;
}
