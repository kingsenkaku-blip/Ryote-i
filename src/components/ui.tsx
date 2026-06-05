// ─────────────────────────────────────────────────────────────
// 共有 UI パーツ（design_reference/app/app-components.jsx を RN 化）
//
// Mono / Tag / ScopeTag / SeverityDots / Toggle / SegBar / PrimaryBtn /
// GhostBtn / Node / Card / SectionLabel / TextField を提供します。
// 配色は useColors() から取得します。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import type { Scope, Severity } from '@/types';
import { MONO_FONT } from '@/lib/theme';
import { useColors } from '@/store/ThemeContext';

/** 等幅テキスト（数字・日時・メタ情報用）。 */
export function Mono({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: MONO_FONT }, style]}>{children}</Text>;
}

type TagTone = 'neutral' | 'accent' | 'outline';

/** 小さなラベル（件数・区分など）。 */
export function Tag({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: TagTone }) {
  const c = useColors();
  const tones: Record<TagTone, { bg: string; fg: string; bd: string }> = {
    neutral: { bg: c.sunken, fg: c.ink2, bd: 'transparent' },
    accent: { bg: c.accentSoft, fg: c.accent, bd: 'transparent' },
    outline: { bg: 'transparent', fg: c.ink2, bd: c.lineStrong },
  };
  const t = tones[tone];
  return (
    <View
      style={{
        height: 22,
        paddingHorizontal: 9,
        borderRadius: 6,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderColor: t.bd,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: t.fg, fontSize: 11.5, fontWeight: '500', letterSpacing: 0.3 }}>{children}</Text>
    </View>
  );
}

/** 国内 / 国際 のバッジ。国際はアクセント色で強調。 */
export function ScopeTag({ scope }: { scope: Scope }) {
  const c = useColors();
  const intl = scope === '国際';
  return (
    <View
      style={{
        height: 22,
        paddingHorizontal: 9,
        borderRadius: 6,
        justifyContent: 'center',
        backgroundColor: intl ? c.accent : c.sunken,
      }}
    >
      <Text
        style={{
          color: intl ? c.accentInk : c.ink2,
          fontSize: 11.5,
          fontWeight: '600',
          letterSpacing: 0.4,
        }}
      >
        {scope}
      </Text>
    </View>
  );
}

/** 重大度を 3 つのドットで表す（高=3・標準=2・低=1）。 */
export function SeverityDots({ level, size = 6 }: { level: Severity; size?: number }) {
  const c = useColors();
  const n = level === '高' ? 3 : level === '標準' ? 2 : 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: 99,
            backgroundColor: i < n ? c.accent : 'transparent',
            borderWidth: 1.3,
            borderColor: i < n ? c.accent : c.lineStrong,
          }}
        />
      ))}
    </View>
  );
}

/** ON/OFF トグルスイッチ。 */
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => onChange(!on)}
      hitSlop={6}
      style={{
        width: 46,
        height: 28,
        borderRadius: 99,
        padding: 0,
        backgroundColor: on ? c.accent : c.lineStrong,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: 99,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

interface SegOption<T extends string> {
  value: T;
  label: string;
}

/** セグメントコントロール（区分・重大度の切替）。 */
export function SegBar<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SegOption<T>[];
  onChange: (v: T) => void;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.sunken, borderRadius: 10, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 7,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? c.surface : 'transparent',
            }}
          >
            <Text style={{ color: on ? c.ink : c.ink2, fontSize: 13, fontWeight: on ? '600' : '500' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** プライマリボタン（高さ52）。 */
export function PrimaryBtn({
  children,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: '100%',
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: disabled ? c.sunken : c.accent,
      }}
    >
      <Text style={{ color: disabled ? c.ink3 : c.accentInk, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 }}>
        {children}
      </Text>
    </Pressable>
  );
}

/** ゴーストボタン（枠線のみ）。 */
export function GhostBtn({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.lineStrong,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: c.ink, fontSize: 14, fontWeight: '500' }}>{children}</Text>
    </Pressable>
  );
}

/** タイムラインのノード（主要予定は塗りつぶし）。 */
export function Node({ filled }: { filled: boolean }) {
  const c = useColors();
  return (
    <View
      style={{
        width: 13,
        height: 13,
        borderRadius: 99,
        backgroundColor: filled ? c.accent : c.surface,
        borderWidth: 2,
        borderColor: filled ? c.accent : c.lineStrong,
      }}
    />
  );
}

/** 角丸カード（コントロールやリストの土台）。 */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 16, padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** セクション見出し（小さな灰色ラベル）。 */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return (
    <Text style={[{ fontSize: 12, color: c.ink2, fontWeight: '600', letterSpacing: 0.5 }, style]}>{children}</Text>
  );
}

/** ラベル付きテキスト入力。 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 12, color: c.ink2, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.ink3}
        style={{
          height: 46,
          paddingHorizontal: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: c.lineStrong,
          backgroundColor: c.surface,
          color: c.ink,
          fontSize: 15,
        }}
      />
    </View>
  );
}
