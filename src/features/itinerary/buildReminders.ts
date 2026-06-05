// ─────────────────────────────────────────────────────────────
// 通知（リマインド）生成エンジン
//
// design_reference/app/app-data.jsx の buildReminders を移植。
//
// ルール（README より）:
//   ・各予定の 1時間前 に通知（重大度=低 のときは主要予定のみ）
//   ・国際線 もしくは 早朝(8時前) の予定は 2回（2時間前＋1時間前）
//   ・重大度=高 は 前日21:00 に「最終確認」を追加
//   ・荷造りリマインド（任意）: 前日 19:30
//   ・宿泊あり: チェックイン3時間前 / チェックアウト1時間前
//
// 設定画面の既定（NotificationDefaults）で各カテゴリを ON/OFF できます。
// また trip.notificationsEnabled が false の旅程は一切通知を生成しません。
// ─────────────────────────────────────────────────────────────
import type { NotificationDefaults, Reminder, Trip } from '@/types';
import { KIND } from '@/lib/constants';
import { D, addH, atTime, isEarly } from '@/lib/datetime';

/** 既定では全カテゴリ ON（設定が渡されなかった場合）。 */
const ALL_ON: NotificationDefaults = {
  lead1h: true,
  doubleIntl: true,
  packing: true,
  checkin: true,
  checkout: true,
};

/**
 * 旅程からリマインドの配列を生成します（発火時刻順）。
 * @param trip 対象の旅程
 * @param prefs 通知の既定設定（省略時は全 ON）
 */
export function buildReminders(trip: Trip, prefs: NotificationDefaults = ALL_ON): Reminder[] {
  // 通知無効の旅程は何も生成しない。
  if (!trip.notificationsEnabled) return [];

  const out: Reminder[] = [];
  const push = (
    when: Date,
    kind: Reminder['kind'],
    label: string,
    sub: string,
    lead: string,
  ): void => {
    out.push({
      id: `${trip.id}-${out.length}`,
      when,
      kind,
      label,
      sub,
      lead,
      tripId: trip.id,
      tripTitle: trip.title,
    });
  };

  // 各予定のリマインド。
  for (const it of trip.items) {
    if (!prefs.lead1h) break; // 「1時間前通知」を全体 OFF にしている場合
    const t = D(it.at);
    const low = trip.severity === '低';
    if (low && !it.key) continue; // 低: 主要予定のみ

    const doubled = (trip.scope === '国際' || isEarly(t)) && prefs.doubleIntl;
    const leads = doubled ? [2, 1] : [1];
    for (const h of leads) {
      push(addH(t, -h), 'item', it.title, it.sub || KIND[it.kind].label, `${h}時間前`);
    }
  }

  // 宿泊（チェックイン3時間前 / チェックアウト1時間前）。
  if (trip.stay) {
    if (prefs.checkin) {
      push(addH(D(trip.stay.checkin), -3), 'checkin', 'チェックイン準備', trip.stay.hotel, '3時間前');
    }
    if (prefs.checkout) {
      push(addH(D(trip.stay.checkout), -1), 'checkout', 'チェックアウト', trip.stay.hotel, '1時間前');
    }
  }

  // 荷造り（前日 19:30）。
  if (trip.packing && prefs.packing) {
    push(atTime(trip.start, 19, 30), 'packing', '荷造りをしてください', `${trip.place}行きの前日`, '前日 19:30');
  }

  // 重大度=高（前日 21:00 に最終確認）。
  if (trip.severity === '高') {
    push(atTime(trip.start, 21, 0), 'final', '最終確認', 'パスポート・予約・持ち物', '前日 21:00');
  }

  return out.sort((a, b) => a.when.getTime() - b.when.getTime());
}

/** 1 予定に紐づく通知の件数（タイムラインのベル ×N 表示用）。 */
export function reminderCountForItem(
  trip: Trip,
  it: Trip['items'][number],
  prefs: NotificationDefaults = ALL_ON,
): number {
  if (!trip.notificationsEnabled || !prefs.lead1h) return 0;
  const t = D(it.at);
  if (trip.severity === '低' && !it.key) return 0;
  return (trip.scope === '国際' || isEarly(t)) && prefs.doubleIntl ? 2 : 1;
}

/** 複数の旅程をまとめて時刻順に並べたリマインド一覧。 */
export function allReminders(trips: Trip[], prefs: NotificationDefaults = ALL_ON): Reminder[] {
  return trips
    .flatMap((t) => buildReminders(t, prefs))
    .sort((a, b) => a.when.getTime() - b.when.getTime());
}
