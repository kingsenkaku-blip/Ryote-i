// ─────────────────────────────────────────────────────────────
// 自然文 → 予定リスト パーサ
//
// design_reference/app/screens-detail.jsx の parseItinerary / guessKind を
// React Native(TypeScript) に移植したものです。
//
// 仕様（README より）:
//   ・行ごとに処理。「6/12 7:09 のぞみ211号」形式
//   ・日付は次の行に引き継ぐ（同じ日なら省略可）
//   ・時刻は「07:09」「7時09」どちらも受理
//   ・キーワードから種別を推測（出発/到着/移動/食事/観光/予定…）
// ─────────────────────────────────────────────────────────────
import type { ItineraryItem, ItemKind } from '@/types';
import { D } from '@/lib/datetime';
import { generateId } from '@/lib/id';

/** 1 行のテキストから予定の種別を推測します。 */
export function guessKind(s: string): ItemKind {
  if (/出発|発つ|発/.test(s)) return 'depart';
  if (/到着|着/.test(s)) return 'arrive';
  if (/チェックイン/.test(s)) return 'checkin';
  if (/チェックアウト/.test(s)) return 'checkout';
  if (/新幹線|電車|のぞみ|ロマンスカー|フライト|便|空港|移動|バス|乗車|発車/.test(s)) return 'transit';
  if (/食事|ランチ|ディナー|夕食|昼食|朝食|夜市|レストラン/.test(s)) return 'food';
  if (/観光|見学|博物館|美術館|寺|神社|散策/.test(s)) return 'sight';
  return 'meet';
}

/** 主要予定（重大度=低でも通知する・2回通知の対象になりうる）かどうか。 */
function isKeyLine(line: string): boolean {
  return /出発|移動|便|のぞみ|空港|新幹線|乗車/.test(line);
}

/**
 * 大まかな旅程テキストを予定（ItineraryItem）の配列に変換します。
 * @param text 入力テキスト（複数行）
 * @param year 年（省略時は今年）
 */
export function parseItinerary(text: string, year: number = new Date().getFullYear()): ItineraryItem[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let curM: number | null = null;
  let curD: number | null = null;
  const items: ItineraryItem[] = [];

  lines.forEach((line) => {
    let s = line;

    // 日付（M/D・M月D日）。見つかれば以降の行へ引き継ぐ。
    const dm = s.match(/^(\d{1,2})\s*[/月]\s*(\d{1,2})日?/);
    if (dm) {
      curM = +dm[1];
      curD = +dm[2];
      s = s.slice(dm[0].length).trim();
    }

    // 時刻（HH:mm / H時mm）。なければ既定 09:00。
    let h = 9;
    let m = 0;
    let hasTime = false;
    const tm = s.match(/(\d{1,2})\s*[:時]\s*(\d{1,2})?/);
    if (tm) {
      h = +tm[1];
      m = tm[2] ? +tm[2] : 0;
      hasTime = true;
      s = (s.slice(0, tm.index) + s.slice((tm.index ?? 0) + tm[0].length)).trim();
    }

    // 先頭の区切り記号を除去。
    s = s.replace(/^[-–・:：]\s*/, '').trim();
    if (!s) s = '予定';

    // 日付未指定なら今日を使う。
    if (curM == null) {
      const d = new Date();
      curM = d.getMonth() + 1;
      curD = d.getDate();
    }

    const at = `${year}-${String(curM).padStart(2, '0')}-${String(curD).padStart(2, '0')}T${String(
      h,
    ).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    items.push({
      id: generateId('item'),
      kind: guessKind(line),
      at,
      title: s,
      sub: '',
      hasTime,
      key: isKeyLine(line),
    });
  });

  return items.sort((a, b) => D(a.at).getTime() - D(b.at).getTime());
}
