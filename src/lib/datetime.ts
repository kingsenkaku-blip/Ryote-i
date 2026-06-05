// ─────────────────────────────────────────────────────────────
// 日付ユーティリティ（純粋関数・外部依存なし）
//
// design_reference/app/app-data.jsx の日付ヘルパーを移植したものです。
// ロジック（パーサ・通知エンジン）から使うため、date-fns ではなく素の
// Date 演算で実装しています（テストしやすく軽量）。
// 文字列は 'YYYY-MM-DDTHH:mm'（ローカル時刻）を前提とします。
// ─────────────────────────────────────────────────────────────

/** 曜日の日本語表記（0=日 .. 6=土）。 */
export const WD = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** 文字列または Date を Date に変換します。 */
export function D(s: string | Date): Date {
  return s instanceof Date ? s : new Date(s);
}

/** 2桁ゼロ埋め。 */
export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** 'HH:mm'。 */
export function fmtTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 'M/D'。 */
export function fmtMD(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 曜日（'日'〜'土'）。 */
export function fmtWD(d: Date): string {
  return WD[d.getDay()];
}

/** d に h 時間を足した新しい Date を返します（負数で前倒し）。 */
export function addH(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 3600 * 1000);
}

/** dateStr（日付）に時:分を設定した Date を返します。 */
export function atTime(dateStr: string, h: number, m: number): Date {
  const d = new Date(dateStr);
  d.setHours(h, m, 0, 0);
  return d;
}

/** 今日を基準に d までの日数差（切り捨てなしの日単位）。 */
export function daysUntil(d: Date, now: Date = new Date()): number {
  const a = new Date(now);
  a.setHours(0, 0, 0, 0);
  const b = new Date(d);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** 「今日 / 明日 / あとN日 / N日前」の相対表記。 */
export function relDay(d: Date, now: Date = new Date()): string {
  const n = daysUntil(d, now);
  if (n === 0) return '今日';
  if (n === 1) return '明日';
  if (n < 0) return `${-n}日前`;
  return `あと${n}日`;
}

/** 早朝（8時より前）か。早朝出発は通知が2回に増えます。 */
export function isEarly(d: Date): boolean {
  return d.getHours() < 8;
}
