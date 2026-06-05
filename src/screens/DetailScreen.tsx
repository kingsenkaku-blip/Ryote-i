// ─────────────────────────────────────────────────────────────
// 旅程詳細画面
//   ・サマリ / 通知設定（重大度・荷造り・宿泊・通知ON/OFF）
//   ・タイムライン / 通知プレビュー / 持ち物 / 操作（複製・アーカイブ・削除）
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Stay, Trip } from '@/types';
import { D, fmtMD, fmtTime, fmtWD } from '@/lib/datetime';
import { buildReminders } from '@/features/itinerary/buildReminders';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { useTrips } from '@/store/TripsContext';
import { Header, RoundBtn } from '@/components/Header';
import { Icon, IconName } from '@/components/icons';
import { Card, Mono, ScopeTag, SectionLabel, SegBar, SeverityDots, Tag, Toggle } from '@/components/ui';
import { TimelineItem } from '@/components/TimelineItem';
import { PackingList } from '@/components/PackingList';

function defaultStay(trip: Trip): Stay {
  return { hotel: '宿泊先', checkin: `${trip.start}T15:00`, checkout: `${trip.end}T11:00` };
}

export function DetailScreen({ tripId }: { tripId: string }) {
  const c = useColors();
  const router = useRouter();
  const { prefs } = usePreferences();
  const { getTrip, updateTrip, deleteTrip, duplicateTrip } = useTrips();
  const trip = getTrip(tripId);

  // 宿泊を OFF→ON に戻したとき、前回の宿泊内容を復元するために保持。
  const [lastStay, setLastStay] = useState<Stay | null>(trip?.stay ?? null);

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: c.page }}>
        <Header title="旅程" left={<RoundBtn icon="back" onPress={() => router.back()} />} />
        <Text style={{ color: c.ink2, textAlign: 'center', marginTop: 40 }}>旅程が見つかりませんでした</Text>
      </View>
    );
  }

  const start = D(trip.start);
  const end = D(trip.end);
  const rs = buildReminders(trip, prefs.notifications);
  const sortedItems = [...trip.items].sort((a, b) => D(a.at).getTime() - D(b.at).getTime());

  const update = (patch: Partial<Trip>) => updateTrip(trip.id, patch);

  const onToggleStay = (on: boolean) => {
    if (on) {
      update({ stay: lastStay ?? defaultStay(trip) });
    } else {
      setLastStay(trip.stay);
      update({ stay: null });
    }
  };

  const onDuplicate = async () => {
    const copy = await duplicateTrip(trip.id);
    if (copy) {
      Alert.alert('複製しました', `「${copy.title}」を作成しました。`);
      router.replace(`/trip/${copy.id}`);
    }
  };

  const onArchive = () => {
    update({ archived: !trip.archived });
    Alert.alert(trip.archived ? 'アーカイブを解除しました' : 'アーカイブしました');
    if (!trip.archived) router.back();
  };

  const onDelete = () => {
    Alert.alert('旅程を削除', `「${trip.title}」を削除しますか？この操作は元に戻せません。`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(trip.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header
        title={trip.place}
        sub={trip.scope === '国際' ? "INT'L" : 'DOMESTIC'}
        left={<RoundBtn icon="back" onPress={() => router.back()} />}
        right={<RoundBtn icon="edit" onPress={() => router.push(`/edit/${trip.id}`)} />}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}>
        {/* サマリ */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 4 }}>
          <Mono style={{ fontSize: 14, color: c.ink2 }}>
            {fmtMD(start)}({fmtWD(start)}) – {fmtMD(end)}({fmtWD(end)})
          </Mono>
          <Text style={{ fontSize: 13, color: c.ink3, flexShrink: 1 }} numberOfLines={1}>
            · {trip.title}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <ScopeTag scope={trip.scope} />
          {trip.notificationsEnabled ? <Tag tone="accent">通知 {rs.length}件</Tag> : <Tag tone="neutral">通知オフ</Tag>}
          {trip.stay ? <Tag tone="neutral">宿泊あり</Tag> : null}
        </View>

        {/* 通知の設定 */}
        <SectionLabel style={{ marginLeft: 2, marginBottom: 10 }}>通知の設定</SectionLabel>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '500', color: c.ink }}>重大度</Text>
              <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>高いほど通知を手厚く、前日に最終確認</Text>
            </View>
            <SeverityDots level={trip.severity} size={7} />
          </View>
          <SegBar
            value={trip.severity}
            options={[
              { value: '低', label: '低' },
              { value: '標準', label: '標準' },
              { value: '高', label: '高' },
            ]}
            onChange={(v) => update({ severity: v })}
          />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '500', color: c.ink }}>荷造りリマインド</Text>
              <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>前日 19:30 に「荷造りをしてください」</Text>
            </View>
            <Toggle on={trip.packing} onChange={(v) => update({ packing: v })} />
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '500', color: c.ink }}>宿泊</Text>
              <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>
                {trip.stay ? trip.stay.hotel : 'チェックイン/アウトの通知なし'}
              </Text>
            </View>
            <Toggle on={!!trip.stay} onChange={onToggleStay} />
          </View>
          {trip.stay ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <StayCell label="チェックイン" d={D(trip.stay.checkin)} />
              <StayCell label="チェックアウト" d={D(trip.stay.checkout)} />
            </View>
          ) : null}
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '500', color: c.ink }}>この旅程は通知しない</Text>
              <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>
                ONにすると通知を生成せず、通知一覧にも出しません
              </Text>
            </View>
            <Toggle on={!trip.notificationsEnabled} onChange={(v) => update({ notificationsEnabled: !v })} />
          </View>
        </Card>

        {/* タイムライン */}
        <SectionLabel style={{ marginLeft: 2, marginTop: 22, marginBottom: 14 }}>タイムライン</SectionLabel>
        <View
          style={{
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 16,
            paddingTop: 18,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          {sortedItems.map((it, i) => (
            <TimelineItem key={it.id} trip={trip} item={it} last={i === sortedItems.length - 1} />
          ))}
        </View>

        {/* 通知プレビュー */}
        {trip.notificationsEnabled && rs.length > 0 ? (
          <>
            <SectionLabel style={{ marginLeft: 2, marginTop: 22, marginBottom: 10 }}>
              この旅程の通知プレビュー
            </SectionLabel>
            <View
              style={{
                backgroundColor: c.surfaceSoft,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 16,
                paddingHorizontal: 16,
              }}
            >
              {rs.map((r, i) => (
                <View
                  key={r.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                    paddingVertical: 11,
                    borderBottomWidth: i === rs.length - 1 ? 0 : 1,
                    borderBottomColor: c.line,
                  }}
                >
                  <Mono style={{ fontSize: 12.5, color: c.ink2, width: 78 }}>
                    {fmtMD(r.when)} {fmtTime(r.when)}
                  </Mono>
                  <Text style={{ fontSize: 13.5, color: c.ink, flex: 1 }} numberOfLines={1}>
                    {r.label}
                  </Text>
                  <Tag tone={r.kind === 'packing' || r.kind === 'final' ? 'accent' : 'neutral'}>{r.lead}</Tag>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* 持ち物チェックリスト */}
        <SectionLabel style={{ marginLeft: 2, marginTop: 22, marginBottom: 10 }}>持ち物チェックリスト</SectionLabel>
        <PackingList tripId={trip.id} items={trip.packingList} />

        {/* 操作 */}
        <SectionLabel style={{ marginLeft: 2, marginTop: 24, marginBottom: 10 }}>操作</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ActionBtn icon="copy" label="複製" onPress={onDuplicate} />
          <ActionBtn
            icon={trip.archived ? 'unarchive' : 'archive'}
            label={trip.archived ? '解除' : 'アーカイブ'}
            onPress={onArchive}
          />
          <ActionBtn icon="trash" label="削除" onPress={onDelete} danger />
        </View>
      </ScrollView>
    </View>
  );
}

function StayCell({ label, d }: { label: string; d: Date }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.sunken, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
      <Text style={{ fontSize: 11, color: c.ink2, marginBottom: 3 }}>{label}</Text>
      <Mono style={{ fontSize: 14, color: c.ink, fontWeight: '500' }}>
        {fmtMD(d)} {fmtTime(d)}
      </Mono>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const c = useColors();
  const color = danger ? '#c0584f' : c.ink;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        height: 64,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Icon name={icon} size={20} color={color} />
      <Text style={{ fontSize: 12, color, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
}
