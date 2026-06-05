// ─────────────────────────────────────────────────────────────
// 表示用フォーマット（date-fns + 日本語ロケール）
//
// UI でのみ使います。ロジック層は datetime.ts を使ってください。
// ─────────────────────────────────────────────────────────────
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

/** 'M月D日(曜)' の長い日付表記。例: 6月12日(金)。 */
export function fmtDateLong(d: Date): string {
  return format(d, 'M月d日(E)', { locale: ja });
}

/** 'M/D(曜)' の短い日付表記。例: 6/12(金)。 */
export function fmtMDWeekday(d: Date): string {
  return format(d, 'M/d(E)', { locale: ja });
}
