// ─────────────────────────────────────────────────────────────
// 通知一覧の 1 行
// design_reference の AlertRow を RN 化。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Text, View } from 'react-native';
import type { Reminder } from '@/types';
import { fmtTime } from '@/lib/datetime';
import { useColors } from '@/store/ThemeContext';
import { Mono, Tag } from './ui';

const KIND_ALERT: Record<Reminder['kind'], { tone: 'accent' | 'neutral' }> = {
  packing: { tone: 'accent' },
  final: { tone: 'accent' },
  checkin: { tone: 'neutral' },
  checkout: { tone: 'neutral' },
  item: { tone: 'neutral' },
};

export function AlertRow({ r, last }: { r: Reminder; last: boolean }) {
  const c = useColors();
  const meta = KIND_ALERT[r.kind];
  const big = r.kind === 'packing' || r.kind === 'final';
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
      }}
    >
      <View style={{ width: 52, alignItems: 'flex-end', paddingTop: 1 }}>
        <Mono style={{ fontSize: 15, color: c.ink, fontWeight: '500' }}>{fmtTime(r.when)}</Mono>
      </View>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          marginTop: 6,
          backgroundColor: big ? c.accent : c.lineStrong,
        }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 15, fontWeight: big ? '600' : '500', color: c.ink }}>{r.label}</Text>
          <Tag tone={meta.tone}>{r.lead}</Tag>
        </View>
        <Text style={{ fontSize: 12.5, color: c.ink2, marginTop: 3 }}>
          {r.sub} <Text style={{ color: c.ink3 }}>· {r.tripTitle}</Text>
        </Text>
      </View>
    </View>
  );
}
