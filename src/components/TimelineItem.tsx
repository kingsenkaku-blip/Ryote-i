// ─────────────────────────────────────────────────────────────
// タイムラインの 1 行（旅程詳細）
// design_reference の TimelineItem を RN 化。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Text, View } from 'react-native';
import type { Trip } from '@/types';
import { D, fmtMD, fmtTime, fmtWD } from '@/lib/datetime';
import { FILLED_KINDS, KIND } from '@/lib/constants';
import { reminderCountForItem } from '@/features/itinerary/buildReminders';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { Icon } from './icons';
import { Mono, Node } from './ui';

export function TimelineItem({
  trip,
  item,
  last,
}: {
  trip: Trip;
  item: Trip['items'][number];
  last: boolean;
}) {
  const c = useColors();
  const { prefs } = usePreferences();
  const t = D(item.at);
  const count = reminderCountForItem(trip, item, prefs.notifications);
  const k = KIND[item.kind];
  const filled = FILLED_KINDS.includes(item.kind);

  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      {/* 時刻 */}
      <View style={{ width: 50, alignItems: 'flex-end', paddingTop: 1 }}>
        <Mono style={{ fontSize: 14.5, color: c.ink, fontWeight: '500' }}>{fmtTime(t)}</Mono>
        <Text style={{ fontSize: 10.5, color: c.ink3, marginTop: 2 }}>
          {fmtMD(t)}({fmtWD(t)})
        </Text>
      </View>

      {/* ノードと縦線 */}
      <View style={{ alignItems: 'center', paddingTop: 3 }}>
        <Node filled={filled} />
        {!last ? <View style={{ width: 2, flex: 1, backgroundColor: c.line, minHeight: 24, marginTop: 2 }} /> : null}
      </View>

      {/* 内容 */}
      <View style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 11, color: c.ink3, fontWeight: '600', letterSpacing: 0.4 }}>{k.label}</Text>
          <View style={{ flex: 1 }} />
          {count > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="bell" size={13} color={count > 1 ? c.accent : c.ink2} />
              <Mono style={{ fontSize: 11, color: count > 1 ? c.accent : c.ink2 }}>×{count}</Mono>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="moon" size={12} color={c.ink3} />
              <Text style={{ fontSize: 10.5, color: c.ink3 }}>サイレント</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 15.5, fontWeight: '600', color: c.ink, marginTop: 2 }}>{item.title}</Text>
        {item.sub ? <Text style={{ fontSize: 13, color: c.ink2, marginTop: 1 }}>{item.sub}</Text> : null}
      </View>
    </View>
  );
}
