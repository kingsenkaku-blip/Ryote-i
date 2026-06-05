// ─────────────────────────────────────────────────────────────
// 設定画面
//   ・通知の既定（1時間前 / 2回 / 荷造り / 宿泊）
//   ・テーマ（システム / ライト / ダーク）
//   ・チュートリアル再表示
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { ThemeMode } from '@/types';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { Header } from '@/components/Header';
import { GhostBtn, SectionLabel, SegBar, Toggle } from '@/components/ui';

function SettingRow({
  title,
  sub,
  control,
  last,
}: {
  title: string;
  sub?: string;
  control: React.ReactNode;
  last?: boolean;
}) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, color: c.ink, fontWeight: '500' }}>{title}</Text>
        {sub ? <Text style={{ fontSize: 12.5, color: c.ink2, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {control}
    </View>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 22,
      }}
    >
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const c = useColors();
  const router = useRouter();
  const { prefs, setThemeMode, setNotificationDefault, setTutorialDone } = usePreferences();
  const n = prefs.notifications;

  const replayTutorial = () => {
    setTutorialDone(false);
    router.push('/tutorial');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header title="設定" sub="DEFAULTS" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28 }}>
        {/* 通知の既定 */}
        <SectionLabel style={{ marginTop: 12, marginBottom: 8, marginLeft: 2 }}>通知の既定</SectionLabel>
        <Group>
          <SettingRow
            title="各予定の1時間前に通知"
            sub="すべての旅程に共通で適用"
            control={<Toggle on={n.lead1h} onChange={(v) => setNotificationDefault('lead1h', v)} />}
          />
          <SettingRow
            title="国際線・早朝は2回通知"
            sub="2時間前 ＋ 1時間前"
            control={<Toggle on={n.doubleIntl} onChange={(v) => setNotificationDefault('doubleIntl', v)} />}
          />
          <SettingRow
            title="荷造りリマインド"
            sub="旅行の前日 19:30"
            control={<Toggle on={n.packing} onChange={(v) => setNotificationDefault('packing', v)} />}
            last
          />
        </Group>

        {/* 宿泊 */}
        <SectionLabel style={{ marginBottom: 8, marginLeft: 2 }}>宿泊</SectionLabel>
        <Group>
          <SettingRow
            title="チェックインの3時間前に通知"
            control={<Toggle on={n.checkin} onChange={(v) => setNotificationDefault('checkin', v)} />}
          />
          <SettingRow
            title="チェックアウトの1時間前に通知"
            control={<Toggle on={n.checkout} onChange={(v) => setNotificationDefault('checkout', v)} />}
            last
          />
        </Group>

        {/* 表示（テーマ） */}
        <SectionLabel style={{ marginBottom: 8, marginLeft: 2 }}>表示</SectionLabel>
        <Group>
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, color: c.ink, fontWeight: '500', marginBottom: 10 }}>外観</Text>
            <SegBar<ThemeMode>
              value={prefs.themeMode}
              options={[
                { value: 'system', label: 'システム' },
                { value: 'light', label: 'ライト' },
                { value: 'dark', label: 'ダーク' },
              ]}
              onChange={setThemeMode}
            />
            <Text style={{ fontSize: 12, color: c.ink2, marginTop: 8 }}>
              「システム」は端末の設定（ライト/ダーク）に追従します。
            </Text>
          </View>
        </Group>

        {/* チュートリアル */}
        <SectionLabel style={{ marginBottom: 8, marginLeft: 2 }}>はじめかた</SectionLabel>
        <Group>
          <SettingRow
            title="チュートリアルをもう一度見る"
            sub="アプリの使い方を最初から表示します"
            control={<GhostBtn onPress={replayTutorial}>再表示</GhostBtn>}
            last
          />
        </Group>

        <Text style={{ fontSize: 11.5, color: c.ink3, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>
          Ryote-i（旅程）{'\n'}通知は端末のローカルスケジュールに登録されます
        </Text>
      </ScrollView>
    </View>
  );
}
