// ─────────────────────────────────────────────────────────────
// InstallBanner — iOS PWA インストール誘導バナー
//
// 表示条件:
//   ・Platform.OS === 'web'
//   ・iOS Safari で開いている（iPad / iPhone / iPod）
//   ・スタンドアロン起動していない（ホーム画面からではない）
//
// スタンドアロン起動中、またはモバイルネイティブ版では非表示。
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/store/ThemeContext';

export function InstallBanner() {
  const c = useColors();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Web 以外（iOS / Android ネイティブ）では不要。
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // iOS Safari かどうか判定（Chrome iOS などは UA に "Safari" が入らない）。
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);

    // ホーム画面から起動（スタンドアロンモード）かどうか。
    const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const navigatorStandalone =
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const isStandalone = mediaStandalone || navigatorStandalone;

    if (isIOS && !isStandalone) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <View
      // pointerEvents="box-none" にすると、バナーが非表示のときもタッチを通過させる。
      // ただし Pressable 内部のタッチは通常通り反応する。
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 84, // タブバー（約56px）＋安全マージン
        left: 16,
        right: 16,
        zIndex: 200,
      }}
    >
      <View
        style={{
          backgroundColor: c.surface,
          borderWidth: 1.5,
          borderColor: c.accent,
          borderRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          // Web の box-shadow と互換する RN のシャドウ指定。
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        }}
      >
        {/* メッセージ */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: c.ink, marginBottom: 2 }}>
            ホーム画面に追加しましょう
          </Text>
          <Text style={{ fontSize: 12, color: c.ink2, lineHeight: 17 }}>
            通知を受け取るにはインストールが必要です
          </Text>
        </View>

        {/* 操作ボタン */}
        <View style={{ flexDirection: 'row', gap: 8, flexShrink: 0 }}>
          <Pressable
            onPress={() => router.push('/install')}
            style={{
              backgroundColor: c.accent,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: c.accentInk, fontSize: 13, fontWeight: '600' }}>
              追加する
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVisible(false)}
            hitSlop={8}
            style={{
              width: 30,
              height: 30,
              borderRadius: 99,
              backgroundColor: c.sunken,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: c.ink2, fontSize: 16, fontWeight: '400', lineHeight: 18 }}>
              ×
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
