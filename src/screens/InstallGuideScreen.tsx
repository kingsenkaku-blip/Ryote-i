// ─────────────────────────────────────────────────────────────
// InstallGuideScreen — iOS PWA インストール手順画面
//
// Safari で「ホーム画面に追加」する手順を 4 ステップで案内します。
// Web で表示される画面です（モバイルネイティブ版から呼ぶことはありません）。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/store/ThemeContext';
import { Header, RoundBtn } from '@/components/Header';
import { Icon } from '@/components/icons';

interface Step {
  num: number;
  emoji: string;
  title: string;
  body: string;
}

const IOS_STEPS: Step[] = [
  {
    num: 1,
    emoji: '🧭',
    title: 'Safari で開く',
    body: 'Chrome などの他ブラウザでは「ホーム画面に追加」機能が使えません。\nまず Safari でこのページを開いてください。',
  },
  {
    num: 2,
    emoji: '📤',
    title: '共有ボタンをタップ',
    body: '画面下部中央の「□↑」ボタン（共有）をタップします。\n見当たらない場合は画面を少し下にスクロールしてみてください。',
  },
  {
    num: 3,
    emoji: '➕',
    title: '「ホーム画面に追加」を選ぶ',
    body: '共有メニューを下にスクロールし、「ホーム画面に追加」をタップします。',
  },
  {
    num: 4,
    emoji: '✅',
    title: '右上の「追加」をタップ',
    body: 'アイコン名を確認して「追加」をタップすると完了です。\nホーム画面に Ryote-i のアイコンが追加されます。',
  },
];

function StepCard({ step }: { step: Step }) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 14,
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* アイコン */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: c.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 24 }}>{step.emoji}</Text>
      </View>

      {/* テキスト */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: c.ink, marginBottom: 5 }}>
          {step.num}. {step.title}
        </Text>
        <Text style={{ fontSize: 13.5, color: c.ink2, lineHeight: 21 }}>
          {step.body}
        </Text>
      </View>
    </View>
  );
}

export function InstallGuideScreen() {
  const c = useColors();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: c.page }}>
      <Header
        title="ホーム画面に追加"
        sub="INSTALL"
        left={<RoundBtn icon="back" onPress={() => router.back()} />}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
      >
        {/* お知らせバナー */}
        <View
          style={{
            backgroundColor: c.accentSoft,
            borderRadius: 14,
            padding: 16,
            marginBottom: 24,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <Icon name="bell" size={20} color={c.accent} />
          <Text style={{ flex: 1, fontSize: 13.5, color: c.ink, lineHeight: 22 }}>
            <Text style={{ fontWeight: '600' }}>ホーム画面から起動しないと</Text>
            、将来追加予定の通知機能が使えません。{'\n'}
            Safari でこのページを開き、以下の手順でインストールしてください。
          </Text>
        </View>

        {/* 手順カード */}
        {IOS_STEPS.map((step) => (
          <StepCard key={step.num} step={step} />
        ))}

        {/* Android 補足 */}
        {Platform.OS === 'web' && (
          <View
            style={{
              marginTop: 8,
              padding: 14,
              backgroundColor: c.sunken,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12.5, color: c.ink2, lineHeight: 19, textAlign: 'center' }}>
              Android Chrome の場合は、ブラウザのメニュー（⋮）から{'\n'}
              「アプリをインストール」または「ホーム画面に追加」を選んでください。
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
