// ─────────────────────────────────────────────────────────────
// 設定（Preferences）のグローバル状態
//
// 起動時に preferencesService から読み込み、変更時に保存します。
// テーマ・チュートリアル既読・通知の既定をここで一元管理します。
// ─────────────────────────────────────────────────────────────
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { NotificationDefaults, Preferences, ThemeMode } from '@/types';
import { DEFAULT_PREFERENCES, preferencesService } from '@/services/preferences';

interface PreferencesContextValue {
  prefs: Preferences;
  /** AsyncStorage からの初回読み込みが完了したか。 */
  loading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setTutorialDone: (done: boolean) => void;
  setNotificationDefault: <K extends keyof NotificationDefaults>(
    key: K,
    value: NotificationDefaults[K],
  ) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // 初回読み込み。
  useEffect(() => {
    let active = true;
    preferencesService.load().then((loaded) => {
      if (active) {
        setPrefs(loaded);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // 変更を保存する共通処理。
  const persist = useCallback((next: Preferences) => {
    setPrefs(next);
    void preferencesService.save(next);
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => persist({ ...prefs, themeMode: mode }),
    [prefs, persist],
  );

  const setTutorialDone = useCallback(
    (done: boolean) => persist({ ...prefs, tutorialDone: done }),
    [prefs, persist],
  );

  const setNotificationDefault = useCallback(
    <K extends keyof NotificationDefaults>(key: K, value: NotificationDefaults[K]) =>
      persist({ ...prefs, notifications: { ...prefs.notifications, [key]: value } }),
    [prefs, persist],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({ prefs, loading, setThemeMode, setTutorialDone, setNotificationDefault }),
    [prefs, loading, setThemeMode, setTutorialDone, setNotificationDefault],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/** 設定にアクセスするフック。 */
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
