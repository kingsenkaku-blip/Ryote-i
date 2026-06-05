// ─────────────────────────────────────────────────────────────
// 画面ヘッダー（カスタム。ステータスバー直下に置く）
// design_reference の Header / RoundBtn を RN 化したもの。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './icons';
import { Mono } from './ui';
import { useColors } from '@/store/ThemeContext';

/** 丸いアイコンボタン（戻る・追加など）。 */
export function RoundBtn({
  icon,
  onPress,
  accent,
}: {
  icon: IconName;
  onPress: () => void;
  accent?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{
        width: 40,
        height: 40,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: accent ? 0 : 1,
        borderColor: c.lineStrong,
        backgroundColor: accent ? c.accent : c.surface,
      }}
    >
      <Icon name={icon} size={19} color={accent ? c.accentInk : c.ink} />
    </Pressable>
  );
}

export function Header({
  title,
  sub,
  left,
  right,
}: {
  title: string;
  sub?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: c.page }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
          minHeight: 52,
        }}
      >
        {left}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 9 }}>
            <Text style={{ fontSize: 21, fontWeight: '700', letterSpacing: 0.5, color: c.ink }}>{title}</Text>
            {sub ? <Mono style={{ fontSize: 11, color: c.ink3, letterSpacing: 1 }}>{sub}</Mono> : null}
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}
