// ─────────────────────────────────────────────────────────────
// 下部タブナビゲーション（ホーム / 通知 / 設定）
// ─────────────────────────────────────────────────────────────
import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { useColors } from '@/store/ThemeContext';
import { Icon } from '@/components/icons';

// タブアイコンはモジュールスコープの安定したコンポーネントとして定義します
// （描画のたびに新しい関数を作らない＝React Compiler のルールにも適合）。
// react-navigation は color を ColorValue で渡してくるため string に読み替えます。
type TabIconProps = { color: ColorValue; focused: boolean };

const HomeTabIcon = ({ color, focused }: TabIconProps) => (
  <Icon name="home" size={22} color={color as string} strokeWidth={focused ? 2 : 1.7} />
);
const AlertsTabIcon = ({ color, focused }: TabIconProps) => (
  <Icon name="bell" size={22} color={color as string} strokeWidth={focused ? 2 : 1.7} />
);
const SettingsTabIcon = ({ color, focused }: TabIconProps) => (
  <Icon name="gear" size={22} color={color as string} strokeWidth={focused ? 2 : 1.7} />
);

export default function TabsLayout() {
  const c = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.ink3,
        tabBarStyle: {
          backgroundColor: c.page,
          borderTopColor: c.line,
        },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'ホーム', tabBarIcon: HomeTabIcon }} />
      <Tabs.Screen name="alerts" options={{ title: '通知', tabBarIcon: AlertsTabIcon }} />
      <Tabs.Screen name="settings" options={{ title: '設定', tabBarIcon: SettingsTabIcon }} />
    </Tabs>
  );
}
