// ─────────────────────────────────────────────────────────────
// ホーム画面（旅程一覧）
//   ・アクティブ / アーカイブ をタブで切替
//   ・先頭の旅程は hero カードで強調
//   ・旅程が無いときは空状態を表示
// ─────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { D } from '@/lib/datetime';
import { useColors } from '@/store/ThemeContext';
import { useTrips } from '@/store/TripsContext';
import { Header, RoundBtn } from '@/components/Header';
import { Icon } from '@/components/icons';
import { SectionLabel, SegBar } from '@/components/ui';
import { TripCard } from '@/components/TripCard';

export function HomeScreen() {
  const c = useColors();
  const router = useRouter();
  const { trips } = useTrips();
  const [view, setView] = useState<'active' | 'archived'>('active');

  const sorted = useMemo(
    () =>
      [...trips]
        .filter((t) => (view === 'archived' ? t.archived : !t.archived))
        .sort((a, b) => D(a.start).getTime() - D(b.start).getTime()),
    [trips, view],
  );

  const [hero, ...rest] = sorted;
  const hasArchived = trips.some((t) => t.archived);

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header title="旅程" sub="RYOTEI" right={<RoundBtn icon="plus" accent onPress={() => router.push('/add')} />} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}>
        {/* アクティブ / アーカイブ 切替（アーカイブが1件以上あるときだけ表示） */}
        {hasArchived ? (
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <SegBar
              value={view}
              options={[
                { value: 'active', label: 'これからの旅程' },
                { value: 'archived', label: 'アーカイブ' },
              ]}
              onChange={setView}
            />
          </View>
        ) : null}

        {sorted.length === 0 ? (
          <EmptyState archived={view === 'archived'} onAdd={() => router.push('/add')} />
        ) : (
          <>
            {view === 'active' && hero ? (
              <>
                <SectionLabel style={{ marginTop: hasArchived ? 0 : 8, marginBottom: 12, marginLeft: 2 }}>
                  次の旅行
                </SectionLabel>
                <TripCard trip={hero} hero onPress={() => router.push(`/trip/${hero.id}`)} />
                {rest.length > 0 ? (
                  <SectionLabel style={{ marginTop: 22, marginBottom: 12, marginLeft: 2 }}>このあとの旅程</SectionLabel>
                ) : null}
                {rest.map((t) => (
                  <TripCard key={t.id} trip={t} onPress={() => router.push(`/trip/${t.id}`)} />
                ))}
              </>
            ) : (
              sorted.map((t) => <TripCard key={t.id} trip={t} onPress={() => router.push(`/trip/${t.id}`)} />)
            )}

            {view === 'active' ? <AddButton onPress={() => router.push('/add')} /> : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 54,
        marginTop: 4,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: c.lineStrong,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Icon name="plus" size={18} color={c.ink2} />
      <Text style={{ color: c.ink2, fontSize: 14.5, fontWeight: '500' }}>旅程を追加</Text>
    </Pressable>
  );
}

function EmptyState({ archived, onAdd }: { archived: boolean; onAdd: () => void }) {
  const c = useColors();
  if (archived) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 80 }}>
        <Icon name="archive" size={40} color={c.ink3} />
        <Text style={{ color: c.ink2, fontSize: 15, marginTop: 14 }}>アーカイブした旅程はありません</Text>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
      <Icon name="pin" size={44} color={c.accent} />
      <Text style={{ color: c.ink, fontSize: 18, fontWeight: '700', marginTop: 16 }}>最初の旅程を作りましょう</Text>
      <Text style={{ color: c.ink2, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 21 }}>
        大まかな予定を入力すると{'\n'}自動でリスト化し、通知を組み立てます。
      </Text>
      <View style={{ marginTop: 22, width: '100%', paddingHorizontal: 24 }}>
        <AddButton onPress={onAdd} />
      </View>
    </View>
  );
}
