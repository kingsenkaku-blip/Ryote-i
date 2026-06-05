// ─────────────────────────────────────────────────────────────
// 初回チュートリアル
//   ・初回起動時のみ表示（完了で prefs.tutorialDone = true）
//   ・設定画面から再表示できます
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/store/ThemeContext';
import { usePreferences } from '@/store/PreferencesContext';
import { Icon, IconName } from '@/components/icons';
import { PrimaryBtn } from '@/components/ui';

interface Step {
  icon: IconName;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  { icon: 'pin', title: 'Ryote-iへようこそ', body: '旅程をまとめて管理し、出発前に通知でそっとお知らせするアプリです。' },
  { icon: 'plus', title: '旅程を追加してみましょう', body: '右上の＋ボタン、または「旅程を追加」から、いつでも新しい旅程を作れます。' },
  { icon: 'edit', title: '自然文入力で自動解析', body: '「6/12 7:09 のぞみ211号」のように書くだけで、予定を自動でリスト化します。' },
  { icon: 'bell', title: '通知を設定できます', body: '各予定の1時間前に通知。国際線や早朝は2回、前日には荷造りリマインドも届きます。' },
  { icon: 'star', title: 'まず最初の旅程を作成しましょう', body: '準備ができたら、さっそく最初の旅程を作ってみましょう。' },
];

export function TutorialScreen() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setTutorialDone } = usePreferences();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = (goAdd: boolean) => {
    setTutorialDone(true);
    if (goAdd) router.replace('/add');
    else router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.page, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* スキップ */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
        <Pressable onPress={() => finish(false)} hitSlop={8}>
          <Text style={{ color: c.ink3, fontSize: 14, fontWeight: '500' }}>スキップ</Text>
        </Pressable>
      </View>

      {/* 中央のコンテンツ */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 99,
            backgroundColor: c.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <Icon name={current.icon} size={44} color={c.accent} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: c.ink, textAlign: 'center' }}>{current.title}</Text>
        <Text style={{ fontSize: 15, color: c.ink2, textAlign: 'center', marginTop: 14, lineHeight: 24 }}>
          {current.body}
        </Text>
      </View>

      {/* ドット */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === step ? 20 : 8,
              height: 8,
              borderRadius: 99,
              backgroundColor: i === step ? c.accent : c.lineStrong,
            }}
          />
        ))}
      </View>

      {/* 操作ボタン */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 10 }}>
        {isLast ? (
          <>
            <PrimaryBtn onPress={() => finish(true)}>最初の旅程を作成</PrimaryBtn>
            <Pressable onPress={() => finish(false)} style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ color: c.ink2, fontSize: 14, fontWeight: '500' }}>あとで</Text>
            </Pressable>
          </>
        ) : (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {step > 0 ? (
              <Pressable
                onPress={() => setStep((s) => s - 1)}
                style={{
                  width: 56,
                  height: 52,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: c.lineStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="back" size={20} color={c.ink} />
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }}>
              <PrimaryBtn onPress={() => setStep((s) => s + 1)}>次へ</PrimaryBtn>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
