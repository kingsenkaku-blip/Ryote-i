// ─────────────────────────────────────────────────────────────
// 通知一覧画面（これから届くリマインドを日別にグループ表示）
//   ・通知無効の旅程は含まれません（buildReminders 側で除外）。
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Reminder } from '@/types';
import { relDay } from '@/lib/datetime';
import { fmtDateLong } from '@/lib/format';
import { allReminders } from '@/features/itinerary/buildReminders';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { useTrips } from '@/store/TripsContext';
import { Header } from '@/components/Header';
import { Icon } from '@/components/icons';
import { AlertRow } from '@/components/AlertRow';

interface DayGroup {
  key: string;
  day: Date;
  rows: Reminder[];
}

export function NotificationsScreen() {
  const c = useColors();
  const { trips } = useTrips();
  const { prefs } = usePreferences();

  const groups = useMemo<DayGroup[]>(() => {
    const now = new Date();
    const rs = allReminders(trips, prefs.notifications).filter((r) => r.when > now);
    const out: DayGroup[] = [];
    for (const r of rs) {
      const key = `${r.when.getFullYear()}-${r.when.getMonth()}-${r.when.getDate()}`;
      let g = out.find((x) => x.key === key);
      if (!g) {
        g = { key, day: r.when, rows: [] };
        out.push(g);
      }
      g.rows.push(r);
    }
    return out;
  }, [trips, prefs.notifications]);

  const total = groups.reduce((n, g) => n + g.rows.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header title="通知" sub={`${total} SCHEDULED`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}>
        {total === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Icon name="bell" size={40} color={c.ink3} />
            <Text style={{ color: c.ink2, fontSize: 15, marginTop: 14, textAlign: 'center' }}>
              これから届く通知はありません
            </Text>
            <Text style={{ color: c.ink3, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              旅程を追加すると、各予定の前に{'\n'}リマインドが自動で組み立てられます。
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: c.ink2, lineHeight: 21, marginTop: 6, marginBottom: 18, marginHorizontal: 2 }}>
              これから届く予定のリマインドです。各予定の1時間前、国際線・早朝は2回、前日19:30に荷造りの通知が入ります。
            </Text>
            {groups.map((g) => (
              <View key={g.key} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>{fmtDateLong(g.day)}</Text>
                  <Text style={{ fontSize: 12, color: c.accent, fontWeight: '600' }}>{relDay(g.day)}</Text>
                </View>
                <View
                  style={{
                    backgroundColor: c.surface,
                    borderWidth: 1,
                    borderColor: c.line,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                  }}
                >
                  {g.rows.map((r, i) => (
                    <AlertRow key={r.id} r={r} last={i === g.rows.length - 1} />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
