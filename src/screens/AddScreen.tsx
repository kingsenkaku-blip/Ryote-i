// ─────────────────────────────────────────────────────────────
// 旅程の追加 / 編集画面
//   ・大まかなテキストを入力するとリアルタイムでパース＆リスト化
//   ・mode='edit' のときは既存の旅程を読み込んで上書き保存
// ─────────────────────────────────────────────────────────────
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Scope, Severity } from '@/types';
import { D, fmtMD, fmtTime } from '@/lib/datetime';
import { MONO_FONT } from '@/lib/theme';
import { KIND } from '@/lib/constants';
import { parseItinerary } from '@/features/itinerary/parseItinerary';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { useTrips } from '@/store/TripsContext';
import { Header, RoundBtn } from '@/components/Header';
import { Mono, PrimaryBtn, SectionLabel, SegBar, TextField, Toggle } from '@/components/ui';

/** 編集時、既存の予定リストをテキストへ戻す（日付は変化時のみ表示）。 */
function itemsToText(items: { at: string; title: string }[]): string {
  let lastDate: string | null = null;
  return items
    .map((it) => {
      const d = D(it.at);
      const dateKey = it.at.slice(0, 10);
      const datePart = dateKey !== lastDate ? `${fmtMD(d)} ` : '';
      lastDate = dateKey;
      return `${datePart}${fmtTime(d)} ${it.title}`;
    })
    .join('\n');
}

export function AddScreen({ mode = 'add', tripId }: { mode?: 'add' | 'edit'; tripId?: string }) {
  const c = useColors();
  const router = useRouter();
  const { prefs } = usePreferences();
  const { addTrip, updateTrip, getTrip } = useTrips();

  const existing = tripId ? getTrip(tripId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [place, setPlace] = useState(existing?.place ?? '');
  const [scope, setScope] = useState<Scope>(existing?.scope ?? '国内');
  const [severity, setSeverity] = useState<Severity>(existing?.severity ?? '標準');
  const [packing, setPacking] = useState<boolean>(existing?.packing ?? prefs.notifications.packing);
  const [hasStay, setHasStay] = useState<boolean>(existing ? !!existing.stay : true);
  const [hotel, setHotel] = useState(existing?.stay?.hotel ?? '');
  const [raw, setRaw] = useState(existing ? itemsToText(existing.items) : '');

  const items = useMemo(() => parseItinerary(raw), [raw]);
  const valid = place.trim().length > 0 && items.length > 0;

  const onSubmit = async () => {
    if (!valid) return;
    const dates = items.map((i) => i.at).sort();
    const start = dates[0].slice(0, 10);
    const end = dates[dates.length - 1].slice(0, 10);
    const stay = hasStay
      ? { hotel: hotel.trim() || '宿泊先', checkin: `${start}T15:00`, checkout: `${end}T11:00` }
      : null;
    const base = {
      title: title.trim() || `${place.trim()}の旅程`,
      place: place.trim(),
      scope,
      severity,
      packing,
      start,
      end,
      stay,
      items,
    };

    if (mode === 'edit' && tripId) {
      await updateTrip(tripId, base);
      router.back();
    } else {
      const created = await addTrip(base);
      router.replace(`/trip/${created.id}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header
        title={mode === 'edit' ? '旅程を編集' : '旅程を追加'}
        sub={mode === 'edit' ? 'EDIT' : 'NEW'}
        left={<RoundBtn icon="back" onPress={() => router.back()} />}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextField label="行き先" value={place} onChangeText={setPlace} placeholder="例: 大阪" />
          <TextField label="旅程名（任意）" value={title} onChangeText={setTitle} placeholder="例: 大阪 出張" />

          {/* 大まかな旅程テキスト */}
          <Text style={{ fontSize: 12, color: c.ink2, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 }}>
            大まかな旅程
          </Text>
          <Text style={{ fontSize: 12, color: c.ink3, marginBottom: 8, lineHeight: 19 }}>
            日付と時刻を1行ずつ。日付は次の行に引き継がれます。
          </Text>
          <TextInput
            value={raw}
            onChangeText={setRaw}
            multiline
            placeholder={'6/12 7:09 のぞみ211号\n9:30 京都駅\n12:00 清水寺'}
            placeholderTextColor={c.ink3}
            style={{
              minHeight: 130,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.lineStrong,
              backgroundColor: c.surface,
              color: c.ink,
              fontFamily: MONO_FONT,
              fontSize: 13.5,
              lineHeight: 22,
              textAlignVertical: 'top',
            }}
          />

          {/* ライブプレビュー */}
          {items.length > 0 ? (
            <View
              style={{
                marginTop: 12,
                backgroundColor: c.surfaceSoft,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: 14,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ fontSize: 11, color: c.accent, fontWeight: '600', paddingTop: 8, paddingBottom: 4, letterSpacing: 0.4 }}>
                {items.length}件をリスト化しました
              </Text>
              {items.map((it, i) => (
                <View
                  key={it.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                    paddingVertical: 9,
                    borderTopWidth: 1,
                    borderTopColor: c.line,
                  }}
                >
                  <Mono style={{ fontSize: 12.5, color: c.ink2, width: 74 }}>
                    {fmtMD(D(it.at))} {fmtTime(D(it.at))}
                  </Mono>
                  <Text style={{ fontSize: 13.5, color: c.ink, flex: 1 }} numberOfLines={1}>
                    {it.title}
                  </Text>
                  <Text style={{ fontSize: 10.5, color: c.ink3 }}>{KIND[it.kind].label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* 区分 */}
          <SectionLabel style={{ marginTop: 22, marginBottom: 8 }}>区分</SectionLabel>
          <SegBar
            value={scope}
            options={[
              { value: '国内', label: '国内' },
              { value: '国際', label: '国際' },
            ]}
            onChange={setScope}
          />
          <Text style={{ fontSize: 11.5, color: c.ink3, marginTop: 7, marginLeft: 2, lineHeight: 17 }}>
            国際線・早朝出発は通知が自動で2回に増えます
          </Text>

          {/* 重大度 */}
          <SectionLabel style={{ marginTop: 18, marginBottom: 8 }}>重大度</SectionLabel>
          <SegBar
            value={severity}
            options={[
              { value: '低', label: '低' },
              { value: '標準', label: '標準' },
              { value: '高', label: '高' },
            ]}
            onChange={setSeverity}
          />

          {/* 荷造り・宿泊 */}
          <View
            style={{
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: 14,
              paddingHorizontal: 16,
              marginTop: 18,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: c.line,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, color: c.ink, fontWeight: '500' }}>荷造りリマインド</Text>
                <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>前日 19:30</Text>
              </View>
              <Toggle on={packing} onChange={setPacking} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, color: c.ink, fontWeight: '500' }}>宿泊する</Text>
                <Text style={{ fontSize: 12, color: c.ink2, marginTop: 2 }}>チェックイン/アウト前に通知</Text>
              </View>
              <Toggle on={hasStay} onChange={setHasStay} />
            </View>
          </View>
          {hasStay ? (
            <View style={{ marginTop: 12 }}>
              <TextField label="宿泊先（任意）" value={hotel} onChangeText={setHotel} placeholder="例: 大阪ステーションホテル" />
            </View>
          ) : null}

          <View style={{ marginTop: 18 }}>
            <PrimaryBtn onPress={onSubmit} disabled={!valid}>
              {mode === 'edit' ? '変更を保存' : '旅程を作成'}
            </PrimaryBtn>
          </View>
          {!valid ? (
            <Text style={{ fontSize: 12, color: c.ink3, textAlign: 'center', marginTop: 10 }}>
              行き先と、1行以上の予定を入力してください
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
