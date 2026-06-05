// ─────────────────────────────────────────────────────────────
// 旅程カード（ホーム画面の一覧用）
// design_reference の TripCard を RN 化。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Trip } from '@/types';
import { D, fmtMD, fmtTime, fmtWD, relDay } from '@/lib/datetime';
import { cardShadow } from '@/lib/theme';
import { buildReminders } from '@/features/itinerary/buildReminders';
import { useColors, useIsDark } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { Icon } from './icons';
import { Mono, ScopeTag, SeverityDots, Tag } from './ui';

export function TripCard({ trip, onPress, hero }: { trip: Trip; onPress: () => void; hero?: boolean }) {
  const c = useColors();
  const isDark = useIsDark();
  const { prefs } = usePreferences();

  const rs = buildReminders(trip, prefs.notifications);
  const now = new Date();
  const next = rs.find((r) => r.when > now) ?? rs[0];
  const start = D(trip.start);
  const end = D(trip.end);

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 18,
          padding: hero ? 20 : 16,
          marginBottom: 12,
        },
        hero ? cardShadow(isDark) : null,
      ]}
    >
      {hero ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <Mono style={{ fontSize: 11, color: c.ink3, letterSpacing: 1.2 }}>NEXT</Mono>
          <Text style={{ fontSize: 13, color: c.accent, fontWeight: '600' }}>{relDay(start)}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: hero ? 26 : 19, fontWeight: '700', color: c.ink, letterSpacing: 0.4 }}>
          {trip.place}
        </Text>
        <ScopeTag scope={trip.scope} />
        {!trip.notificationsEnabled ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Icon name="moon" size={13} color={c.ink3} />
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Icon name="chevron" size={18} color={c.ink3} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <Mono style={{ fontSize: 13.5, color: c.ink2, letterSpacing: 0.4 }}>
          {fmtMD(start)}({fmtWD(start)}) – {fmtMD(end)}({fmtWD(end)})
        </Mono>
        <Text style={{ fontSize: 13, color: c.ink3, flexShrink: 1 }} numberOfLines={1}>
          · {trip.title}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: c.line, marginTop: 14, marginBottom: 12 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 11.5, color: c.ink3 }}>重大度</Text>
          <SeverityDots level={trip.severity} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="bell" size={14} color={c.ink2} />
          <Mono style={{ fontSize: 12, color: c.ink2 }}>{rs.length}件</Mono>
        </View>
        <View style={{ flex: 1 }} />
        {next ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={13} color={c.ink3} />
            <Mono style={{ fontSize: 12, color: c.ink2 }}>
              {fmtMD(next.when)} {fmtTime(next.when)}
            </Mono>
          </View>
        ) : (
          <Tag tone="neutral">通知オフ</Tag>
        )}
      </View>
    </Pressable>
  );
}
