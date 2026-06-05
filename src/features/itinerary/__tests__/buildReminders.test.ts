import { describe, expect, it } from '@jest/globals';
import type { NotificationDefaults, Trip } from '@/types';
import { buildReminders, reminderCountForItem } from '@/features/itinerary/buildReminders';

/** テスト用の最小 Trip を作るヘルパー。 */
function makeTrip(over: Partial<Trip> = {}): Trip {
  const now = '2026-01-01T00:00:00.000Z';
  return {
    id: 'trip-1',
    title: 'テスト旅程',
    place: 'テスト',
    scope: '国内',
    severity: '標準',
    packing: false,
    start: '2026-06-12',
    end: '2026-06-13',
    stay: null,
    items: [
      { id: 'i1', kind: 'transit', at: '2026-06-12T09:00', title: '移動', sub: '', key: true },
    ],
    packingList: [],
    notificationsEnabled: true,
    archived: false,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
    ...over,
  };
}

const ALL_ON: NotificationDefaults = {
  lead1h: true,
  doubleIntl: true,
  packing: true,
  checkin: true,
  checkout: true,
};

describe('buildReminders', () => {
  it('通常の予定は1時間前に1件', () => {
    const rs = buildReminders(makeTrip(), ALL_ON);
    expect(rs).toHaveLength(1);
    expect(rs[0].lead).toBe('1時間前');
    expect(rs[0].when.getHours()).toBe(8); // 09:00 の1時間前
  });

  it('国際線は2時間前＋1時間前の2件', () => {
    const rs = buildReminders(makeTrip({ scope: '国際' }), ALL_ON);
    expect(rs).toHaveLength(2);
    expect(rs.map((r) => r.lead)).toEqual(['2時間前', '1時間前']);
  });

  it('早朝出発（8時前）は国内でも2件', () => {
    const rs = buildReminders(
      makeTrip({ items: [{ id: 'i1', kind: 'depart', at: '2026-06-12T06:00', title: '出発', sub: '', key: true }] }),
      ALL_ON,
    );
    expect(rs).toHaveLength(2);
  });

  it('重大度=低 は主要予定のみ通知する', () => {
    const trip = makeTrip({
      severity: '低',
      items: [
        { id: 'i1', kind: 'transit', at: '2026-06-12T09:00', title: '移動', sub: '', key: true },
        { id: 'i2', kind: 'meet', at: '2026-06-12T12:00', title: '打合せ', sub: '', key: false },
      ],
    });
    const rs = buildReminders(trip, ALL_ON);
    expect(rs).toHaveLength(1);
    expect(rs[0].label).toBe('移動');
  });

  it('荷造りONで前日19:30の通知が増える', () => {
    const rs = buildReminders(makeTrip({ packing: true }), ALL_ON);
    const packing = rs.find((r) => r.kind === 'packing');
    expect(packing).toBeDefined();
    expect(packing?.lead).toBe('前日 19:30');
    expect(packing?.when.getHours()).toBe(19);
    expect(packing?.when.getMinutes()).toBe(30);
  });

  it('重大度=高で前日21:00の最終確認が増える', () => {
    const rs = buildReminders(makeTrip({ severity: '高' }), ALL_ON);
    const final = rs.find((r) => r.kind === 'final');
    expect(final).toBeDefined();
    expect(final?.when.getHours()).toBe(21);
  });

  it('宿泊ありでチェックイン3時間前・チェックアウト1時間前が増える', () => {
    const trip = makeTrip({
      stay: { hotel: 'テストホテル', checkin: '2026-06-12T15:00', checkout: '2026-06-13T11:00' },
    });
    const rs = buildReminders(trip, ALL_ON);
    const ci = rs.find((r) => r.kind === 'checkin');
    const co = rs.find((r) => r.kind === 'checkout');
    expect(ci?.when.getHours()).toBe(12); // 15:00 の3時間前
    expect(co?.when.getHours()).toBe(10); // 11:00 の1時間前
  });

  it('通知無効の旅程は何も生成しない', () => {
    const rs = buildReminders(makeTrip({ notificationsEnabled: false, packing: true, severity: '高' }), ALL_ON);
    expect(rs).toHaveLength(0);
  });

  it('設定で2回通知をOFFにすると国際線でも1件', () => {
    const prefs: NotificationDefaults = { ...ALL_ON, doubleIntl: false };
    const rs = buildReminders(makeTrip({ scope: '国際' }), prefs);
    expect(rs).toHaveLength(1);
  });

  it('発火時刻の昇順で並ぶ', () => {
    const trip = makeTrip({
      packing: true,
      severity: '高',
      stay: { hotel: 'H', checkin: '2026-06-12T15:00', checkout: '2026-06-13T11:00' },
    });
    const rs = buildReminders(trip, ALL_ON);
    for (let i = 1; i < rs.length; i++) {
      expect(rs[i].when.getTime()).toBeGreaterThanOrEqual(rs[i - 1].when.getTime());
    }
  });
});

describe('reminderCountForItem', () => {
  it('国内・標準の通常予定は1', () => {
    const trip = makeTrip();
    expect(reminderCountForItem(trip, trip.items[0], ALL_ON)).toBe(1);
  });

  it('通知無効なら0', () => {
    const trip = makeTrip({ notificationsEnabled: false });
    expect(reminderCountForItem(trip, trip.items[0], ALL_ON)).toBe(0);
  });
});
