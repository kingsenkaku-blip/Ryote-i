// ─────────────────────────────────────────────────────────────
// Web 専用: HTML ドキュメントのルート設定（expo-router +html.tsx）
// モバイル（iOS / Android）ビルドには影響しません。
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ScrollView を native に近い挙動にするリセット CSS */}
        <ScrollViewStyleReset />

        {/* PWA マニフェスト */}
        <link rel="manifest" href="/manifest.json" />

        {/*
          iOS Safari は manifest の display / icons の一部を無視するため
          apple-mobile-web-app-* メタタグを個別に指定します。
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* ブラウザのテーマカラー（アドレスバーなど） */}
        <meta name="theme-color" content="#2f6f5e" />
      </head>
      <body>{children}</body>
    </html>
  );
}
