import { describe, expect, it } from '@jest/globals';
import { guessKind, parseItinerary } from '@/features/itinerary/parseItinerary';

describe('parseItinerary', () => {
  it('README の例（3行）を正しくリスト化する', () => {
    const text = ['6/12 7:09 のぞみ211号', '9:30 京都駅', '12:00 清水寺'].join('\n');
    const items = parseItinerary(text, 2026);

    expect(items).toHaveLength(3);
    // 並び順は時刻順。
    expect(items[0].at).toBe('2026-06-12T07:09');
    expect(items[0].title).toBe('のぞみ211号');
    expect(items[0].kind).toBe('transit');
    expect(items[0].key).toBe(true); // 「のぞみ」は主要予定

    // 日付は次の行に引き継がれる。
    expect(items[1].at).toBe('2026-06-12T09:30');
    expect(items[1].title).toBe('京都駅');

    expect(items[2].at).toBe('2026-06-12T12:00');
    expect(items[2].title).toBe('清水寺');
    expect(items[2].kind).toBe('sight'); // 「寺」→ 観光
  });

  it('日付をまたぐ行も引き継いだ日付を更新する', () => {
    const text = ['6/12 7:00 出発', '6/13 14:00 帰路'].join('\n');
    const items = parseItinerary(text, 2026);
    expect(items[0].at).toBe('2026-06-12T07:00');
    expect(items[1].at).toBe('2026-06-13T14:00');
  });

  it('「7時09」形式の時刻も受理する', () => {
    const items = parseItinerary('6/12 7時09 移動', 2026);
    expect(items[0].at).toBe('2026-06-12T07:09');
  });

  it('時刻が無い行は 09:00 を既定にする', () => {
    const items = parseItinerary('6/12 自宅を出発', 2026);
    expect(items[0].at).toBe('2026-06-12T09:00');
    expect(items[0].hasTime).toBe(false);
  });

  it('空行は無視される', () => {
    const items = parseItinerary('\n\n6/12 9:00 観光\n\n', 2026);
    expect(items).toHaveLength(1);
  });

  it('guessKind がキーワードから種別を推測する', () => {
    expect(guessKind('羽田を出発')).toBe('depart');
    expect(guessKind('京都に到着')).toBe('arrive');
    expect(guessKind('ホテルにチェックイン')).toBe('checkin');
    expect(guessKind('NH853便')).toBe('transit');
    expect(guessKind('士林夜市で夕食')).toBe('food');
    expect(guessKind('故宮博物院を見学')).toBe('sight');
    expect(guessKind('打ち合わせ')).toBe('meet');
  });
});
