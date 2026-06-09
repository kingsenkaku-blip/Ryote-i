// ─────────────────────────────────────────────────────────────
// ルートレイアウト（アプリ全体の土台）
//   ・各種 Provider（設定・テーマ・旅程）を組み立て
//   ・データ読み込み完了までスプラッシュを表示
//   ・データ変更時にローカル通知を再同期
//
// チュートリアルへの初回誘導は app/(tabs)/index.tsx の <Redirect> で行います。
// _layout から router.replace を呼ぶとナビゲーターが未初期化のまま
// GO_BACK を発火するため、expo-router 推奨の Redirect コンポーネント方式に変更。
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { PreferencesProvider, usePreferences } from '@/store/PreferencesContext';
import { ThemeProvider, useColors, useIsDark } from '@/store/ThemeContext';
import { TripsProvider, useTrips } from '@/store/TripsContext';
import { ensurePermissions, syncScheduledNotifications } from '@/services/notifications';
import { InstallBanner } from '@/components/InstallBanner';

// データ読み込みが終わるまでスプラッシュを保持。
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const c = useColors();
  const isDark = useIsDark();
  const { prefs, loading: prefsLoading } = usePreferences();
  const { trips, loading: tripsLoading } = useTrips();

  const ready = !prefsLoading && !tripsLoading;

  // 準備完了でスプラッシュを閉じる。
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  // 通知許可のリクエスト（初回のみ）。
  useEffect(() => {
    void ensurePermissions();
  }, []);

  // Service Worker を登録（Web のみ）。
  // HTTPS 環境または localhost でのみ動作します。
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 登録失敗は無視（開発時の HTTP 環境など）。
    });
  }, []);

  // 旅程／設定が変わるたびに通知を再同期。
  useEffect(() => {
    if (ready) void syncScheduledNotifications(trips, prefs);
  }, [ready, trips, prefs]);

  // ready になるまでは SplashScreen が画面を隠しているので null を返せる。
  // Stack は常に描画しても構わないが、null にしておくと不要な再レンダリングを防ぐ。
  if (!ready) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.page },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[id]" />
        <Stack.Screen name="add" />
        <Stack.Screen name="edit/[id]" />
        <Stack.Screen name="tutorial" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="install" />
      </Stack>
      {/* iOS PWA インストール誘導バナー（Web + iOS + 非スタンドアロンのみ表示） */}
      <InstallBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <ThemeProvider>
            <TripsProvider>
              <RootNavigator />
            </TripsProvider>
          </ThemeProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
