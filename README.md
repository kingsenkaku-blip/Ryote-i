# Ryote-i（旅程）

旅程を管理する iOS / Android アプリです。大まかな予定をテキストで入力すると自動でリスト化し、
各予定の前にローカル通知でお知らせします。**Expo（React Native + TypeScript）** で実装しており、
Windows でも **Expo Go** で実機確認、**EAS Build** で iOS バイナリの作成ができます。

> このプロジェクトは `design_handoff_ryote_i/`（HTML/JSX のデザイン参考資料）をもとに、
> React Native の流儀で実装し直したものです。

---

## 主な機能

- **旅程管理** … 作成 / 編集 / 削除 / 複製 / アーカイブ（アーカイブは別表示）
- **自然文入力** … 「6/12 7:09 のぞみ211号」のように書くと予定を自動解析（ライブプレビュー付き）
- **通知** … 各予定の1時間前 / 国際線・早朝は2回 / 前日19:30 荷造り / 前日21:00 最終確認（重大度=高）/ 宿泊チェックイン3時間前・アウト1時間前
- **旅程ごとの通知オフ** … 「この旅程は通知しない」を設定すると通知も通知一覧も出ません
- **持ち物チェックリスト** … 旅程ごとに 追加 / 編集 / 削除 / チェック
- **ダークモード** … システム追従 / ライト / ダーク を手動切替
- **初回チュートリアル** … 初回のみ表示。設定画面から再表示できます

初回起動時はサンプルデータを含まず**空の状態**から始まります。

---

## はじめに（開発環境）

### 1. Node.js（重要）

最新の Expo SDK には **Node.js 20 以上（LTS 推奨）** が必要です。
`node --version` で確認し、18 未満の場合は [nodejs.org](https://nodejs.org/) から LTS をインストールしてください。

> Windows で管理者権限なしに入れたい場合は、ZIP 版を展開して PATH を通す方法もあります。

### 2. 依存パッケージのインストール

```powershell
npm install
```

### 3. 開発サーバーの起動（Expo Go で確認）

```powershell
npx expo start
```

- ターミナルに表示される **QR コード** を、iPhone の **Expo Go** アプリ（App Store で入手）で読み取ると起動します。
- スマホと PC が**同じ Wi‑Fi** に繋がっている必要があります。繋がりにくいときは `npx expo start --tunnel` を試してください。

> **通知についての注意**：iOS の実機通知は Expo Go でも動作確認できますが、より確実に試すには
> 後述の **開発ビルド（development build）** または本番ビルドの使用を推奨します。
> シミュレータや Web では通知は登録されません。

---

## よく使うコマンド

| コマンド | 説明 |
|---|---|
| `npm start` / `npx expo start` | 開発サーバー起動 |
| `npm test` | ユニットテスト（パーサ・通知エンジン）を実行 |
| `npm run typecheck` | TypeScript の型チェック（`tsc --noEmit`） |
| `npm run lint` | ESLint |

---

## フォルダ構成

```
Ryote-i/
├── app/                         # 画面のルーティング（expo-router。ファイル＝画面）
│   ├── _layout.tsx              # アプリの土台（Provider・スプラッシュ・通知同期・初回誘導）
│   ├── (tabs)/                  # 下部タブ（ホーム / 通知 / 設定）
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # ホーム
│   │   ├── alerts.tsx           # 通知一覧
│   │   └── settings.tsx         # 設定
│   ├── trip/[id].tsx            # 旅程詳細
│   ├── add.tsx                  # 旅程の追加
│   ├── edit/[id].tsx            # 旅程の編集
│   └── tutorial.tsx             # 初回チュートリアル
│
├── src/
│   ├── types/                   # ドメインの型定義（Trip など）
│   ├── lib/                     # 共通ユーティリティ（日付・テーマ・定数・ID）
│   ├── features/itinerary/      # 中核ロジック：parseItinerary / buildReminders（＋テスト）
│   ├── repositories/            # 永続化の抽象化（下記参照）
│   ├── services/                # 通知（expo-notifications）・設定の保存
│   ├── store/                   # React Context（旅程・設定・テーマ）
│   ├── components/              # 再利用 UI（アイコン・カード・トグル等）
│   └── screens/                 # 画面の中身（app/ から呼び出される）
│
├── assets/                      # アイコン・スプラッシュ画像
├── app.json                     # Expo の設定
├── eas.json                     # EAS Build の設定
└── design_handoff_ryote_i/      # デザイン参考資料（アプリ本体には含めません）
```

### 設計の考え方（プログラミング初心者向け）

- **画面（app/）と中身（src/screens/）を分離**しています。`app/` は「どの URL がどの画面か」を決めるだけの薄い層です。
- **UI から直接 AsyncStorage を呼びません**。保存は必ず `repositories/` や `services/` を経由します。
  これにより、将来クラウド保存（Supabase）に切り替えても **画面側のコードを変えずに済みます**。
- 中核ロジック（自然文パーサ・通知の組み立て）は **React Native に依存しない純粋な関数**として
  `src/features/itinerary/` に置き、ユニットテストで守っています。

---

## データの保存（Repository パターン）

旅程の保存は `ItineraryRepository`（インターフェース）越しに行います。

```ts
interface ItineraryRepository {
  getAll(): Promise<Trip[]>;
  getById(id: string): Promise<Trip | null>;
  save(trip: Trip): Promise<Trip>;
  update(id: string, patch: Partial<Trip>): Promise<Trip>;
  delete(id: string): Promise<void>;
}
```

- 現在の実装：`AsyncStorageItineraryRepository`（端末内に保存）
- 差し替え口：`src/repositories/index.ts` の 1 行だけ

将来 Supabase を導入するときは `SupabaseItineraryRepository` を作って index.ts を差し替えるだけで、
画面のコードはそのまま動きます。データモデルには共有を見据えて `isPublic` / `createdAt` / `updatedAt` を
最初から持たせています（現段階で共有機能は未実装）。

---

## 通知の仕組み

- ロジック本体は `src/features/itinerary/buildReminders.ts`（旅程 → 通知一覧を生成）。
- それを `src/services/notifications.ts` が **端末のローカル通知**として登録します。
- iOS のローカル通知は同時に**最大 64 件**まで。先のものから 64 件を登録し、
  旅程や設定が変わるたびに**全消去 → 再登録**します（`app/_layout.tsx` の useEffect）。
- 通知オフの旅程は生成対象から除外されます。

---

## iOS ビルド（EAS Build）

Windows では Xcode が使えないため、配布用ビルドは **EAS Build** をクラウドで実行します。

```powershell
# 1. EAS CLI を入れる（初回のみ）
npm install -g eas-cli

# 2. Expo アカウントでログイン（無料アカウントで可）
eas login

# 3. プロジェクトを EAS に紐付け（初回のみ。projectId が app.json に書かれます）
eas init

# 4. iOS ビルド（Apple Developer アカウントの連携が必要）
eas build -p ios
```

- 実機にインストールして試すだけなら、開発ビルドが便利です：
  ```powershell
  eas build -p ios --profile development
  ```
- ビルドプロファイルは `eas.json` で定義しています（development / preview / production）。
- App Store 配布には **有料の Apple Developer Program** が必要です。

---

## デザイントークン（抜粋）

| 用途 | Light | Dark |
|---|---|---|
| アクセント | `#2f6f5e` | `#73b29f` |
| 背景 | `#f4f2ec` | `#1a1916` |
| サーフェス | `#ffffff` | `#232220` |
| 文字 | `#1c1b18` | `#ece8e0` |

すべての配色は `src/lib/theme.ts` の `makeTheme()` にまとまっています。

---

## ライセンス / クレジット

個人開発プロジェクト。デザイン参考資料は `design_handoff_ryote_i/` を参照。
