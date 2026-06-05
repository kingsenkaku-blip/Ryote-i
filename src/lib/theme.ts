// ─────────────────────────────────────────────────────────────
// テーマトークン（暖色モノトーン + ミュートなティール）
//
// README / design_reference の makeTheme を移植。RN 用に box-shadow を
// shadow プロパティへ置き換えるためのヘルパー shadow も用意しています。
// ─────────────────────────────────────────────────────────────
import type { ViewStyle } from 'react-native';

export interface Colors {
  dark: boolean;
  page: string;
  surface: string;
  surfaceSoft: string;
  sunken: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  lineStrong: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
}

/** dark フラグから配色を生成します。 */
export function makeTheme(dark: boolean): Colors {
  return dark
    ? {
        dark: true,
        page: '#1a1916',
        surface: '#232220',
        surfaceSoft: '#2b2a27',
        sunken: '#1f1e1b',
        ink: '#ece8e0',
        ink2: '#a39e93',
        ink3: '#6f6b62',
        line: 'rgba(255,255,255,0.09)',
        lineStrong: 'rgba(255,255,255,0.16)',
        accent: '#73b29f',
        accentInk: '#0f1714',
        accentSoft: 'rgba(115,178,159,0.16)',
      }
    : {
        dark: false,
        page: '#f4f2ec',
        surface: '#ffffff',
        surfaceSoft: '#faf8f3',
        sunken: '#efece4',
        ink: '#1c1b18',
        ink2: '#76726a',
        ink3: '#a8a39a',
        line: 'rgba(28,27,24,0.09)',
        lineStrong: 'rgba(28,27,24,0.16)',
        accent: '#2f6f5e',
        accentInk: '#ffffff',
        accentSoft: 'rgba(47,111,94,0.10)',
      };
}

/**
 * カードなどに使う柔らかい影。Web の box-shadow を RN のシャドウ
 * プロパティへ置き換えたものです（iOS は shadow*, Android は elevation）。
 */
export function cardShadow(dark: boolean): ViewStyle {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: dark ? 0.34 : 0.08,
    shadowRadius: 16,
    elevation: 4,
  };
}

/** 等幅フォント（数字・メタ情報用）。iOS/Android の標準等幅を使用。 */
export const MONO_FONT = 'Menlo';
