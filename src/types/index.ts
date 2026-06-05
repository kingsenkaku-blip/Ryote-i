// ─────────────────────────────────────────────────────────────
// ドメインモデル（アプリ全体で使う型）
//
// 旅程(Trip) を中心に、予定(ItineraryItem)・宿泊(Stay)・持ち物(PackingItem)
// などを表します。将来の Supabase 連携を見据えて createdAt / updatedAt /
// isPublic も最初から持たせています。
// ─────────────────────────────────────────────────────────────

/** 旅程の区分。国際線は通知が手厚くなります。 */
export type Scope = '国内' | '国際';

/** 重大度。高いほど通知が増えます（低=主要のみ / 高=前日21:00に最終確認）。 */
export type Severity = '低' | '標準' | '高';

/** 予定の種別。グリフ（アイコン）とラベルは constants.ts の KIND で定義。 */
export type ItemKind =
  | 'depart' // 出発
  | 'transit' // 移動（新幹線・便など）
  | 'arrive' // 到着
  | 'checkin' // チェックイン
  | 'checkout' // チェックアウト
  | 'meet' // 予定（その他）
  | 'food' // 食事
  | 'sight'; // 観光

/** タイムライン上の 1 予定。`at` は 'YYYY-MM-DDTHH:mm'（ローカル時刻）。 */
export interface ItineraryItem {
  id: string;
  kind: ItemKind;
  at: string;
  title: string;
  sub: string;
  /** 主要予定か（重大度=低でも通知する／2回通知の対象判定に使う）。 */
  key?: boolean;
  /** パーサが時刻を読み取れたか（読めない場合は既定 09:00）。 */
  hasTime?: boolean;
}

/** 宿泊先。チェックイン3時間前・チェックアウト1時間前に通知します。 */
export interface Stay {
  hotel: string;
  /** 'YYYY-MM-DDTHH:mm'（ローカル時刻）。 */
  checkin: string;
  checkout: string;
}

/** 持ち物チェックリストの 1 項目。 */
export interface PackingItem {
  id: string;
  label: string;
  done: boolean;
}

/**
 * 旅程の本体。
 * 永続化（AsyncStorage / 将来は Supabase）される単位です。
 */
export interface Trip {
  id: string;
  title: string;
  place: string;
  scope: Scope;
  severity: Severity;
  /** 荷造りリマインド（前日19:30）の ON/OFF。 */
  packing: boolean;
  /** 開始日 'YYYY-MM-DD'。 */
  start: string;
  /** 終了日 'YYYY-MM-DD'。 */
  end: string;
  /** 宿泊先。なければ null。 */
  stay: Stay | null;
  items: ItineraryItem[];
  /** 旅程ごとの持ち物リスト。 */
  packingList: PackingItem[];
  /** この旅程の通知を生成するか。false なら通知一覧にも出しません。 */
  notificationsEnabled: boolean;
  /** アーカイブ済みか。true ならホームの「アーカイブ」表示に移動します。 */
  archived: boolean;

  // ── 将来の共有機能（Supabase）用。現段階では UI からは編集しません ──
  /** 公開旅程として共有するか（将来用）。 */
  isPublic: boolean;
  /** 作成日時（ISO 文字列）。 */
  createdAt: string;
  /** 更新日時（ISO 文字列）。 */
  updatedAt: string;
}

/** buildReminders が生成する通知（リマインド）1 件。 */
export interface Reminder {
  id: string;
  /** 通知が発火する日時。 */
  when: Date;
  kind: 'item' | 'checkin' | 'checkout' | 'packing' | 'final';
  label: string;
  sub: string;
  /** 「1時間前」「前日 19:30」などの表示用ラベル。 */
  lead: string;
  tripId: string;
  tripTitle: string;
}

/** 通知の既定設定（設定画面）。新規旅程の初期値や通知の絞り込みに使います。 */
export interface NotificationDefaults {
  /** 各予定の1時間前に通知。 */
  lead1h: boolean;
  /** 国際線・早朝は2回通知（2時間前＋1時間前）。 */
  doubleIntl: boolean;
  /** 荷造りリマインド（前日19:30）。 */
  packing: boolean;
  /** 宿泊チェックイン3時間前。 */
  checkin: boolean;
  /** 宿泊チェックアウト1時間前。 */
  checkout: boolean;
}

/** 外観テーマの選択。system は端末設定に追従します。 */
export type ThemeMode = 'system' | 'light' | 'dark';

/** 永続化されるアプリ設定。 */
export interface Preferences {
  themeMode: ThemeMode;
  /** チュートリアルを表示し終えたか（true なら再表示しない）。 */
  tutorialDone: boolean;
  notifications: NotificationDefaults;
}
