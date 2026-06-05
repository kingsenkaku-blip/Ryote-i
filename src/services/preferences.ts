// ─────────────────────────────────────────────────────────────
// 設定（Preferences）の永続化サービス
//
// テーマ・チュートリアル既読・通知の既定を端末に保存します。
// 旅程とは別キーで管理します。UI からは PreferencesContext 経由で使い、
// AsyncStorage には直接触れません。
// ─────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Preferences } from '@/types';

const STORAGE_KEY = 'ryotei:preferences:v1';

/** 初期設定（初回起動時の既定値）。 */
export const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'system',
  tutorialDone: false,
  notifications: {
    lead1h: true,
    doubleIntl: true,
    packing: true,
    checkin: true,
    checkout: true,
  },
};

export const preferencesService = {
  /** 設定を読み込みます。未保存の項目は既定値で補完します。 */
  async load(): Promise<Preferences> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    try {
      const parsed = JSON.parse(raw) as Partial<Preferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        notifications: {
          ...DEFAULT_PREFERENCES.notifications,
          ...(parsed.notifications ?? {}),
        },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  /** 設定を保存します。 */
  async save(prefs: Preferences): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  },
};
