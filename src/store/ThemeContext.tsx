// ─────────────────────────────────────────────────────────────
// テーマ（配色）のグローバル状態
//
// prefs.themeMode（system / light / dark）と端末の useColorScheme() から
// 実際の配色を決め、useColors() で各画面に配ります。
// ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { Colors } from '@/lib/theme';
import { makeTheme } from '@/lib/theme';
import { usePreferences } from './PreferencesContext';

interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { prefs } = usePreferences();
  const system = useColorScheme(); // 'light' | 'dark' | null

  const isDark = useMemo(() => {
    if (prefs.themeMode === 'system') return system === 'dark';
    return prefs.themeMode === 'dark';
  }, [prefs.themeMode, system]);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors: makeTheme(isDark), isDark }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** 現在の配色（Colors）を取得します。design_reference の useC に相当。 */
export function useColors(): Colors {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useColors must be used within ThemeProvider');
  return ctx.colors;
}

/** ダークモードかどうかを取得します。 */
export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useIsDark must be used within ThemeProvider');
  return ctx.isDark;
}
