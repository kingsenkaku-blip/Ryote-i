// ホームタブ → 未チュートリアルなら tutorial へ Redirect、済みなら HomeScreen
//
// router.replace をレイアウトから呼ぶと「GO_BACK was not handled」エラーが出るため、
// expo-router の推奨パターンである Redirect コンポーネントをここで使います。
// Redirect はナビゲーターが初期化済みの状態で描画されるので安全です。
import React from 'react';
import { Redirect } from 'expo-router';
import { usePreferences } from '@/store/PreferencesContext';
import { HomeScreen } from '@/screens/HomeScreen';

export default function HomeRoute() {
  const { prefs, loading } = usePreferences();

  // まだ prefs を読み込み中なら何も描画しない（SplashScreen が隠している）。
  if (loading) return null;

  // 初回起動（チュートリアル未完了）はチュートリアルへ。
  if (!prefs.tutorialDone) return <Redirect href="/tutorial" />;

  return <HomeScreen />;
}
