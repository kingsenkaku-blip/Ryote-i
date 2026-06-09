// ─────────────────────────────────────────────────────────────
// Ryote-i Service Worker
// Phase 1: アプリシェルのオフラインキャッシュ（最小構成）
// Phase 3 で Push 通知サポートを追加予定。
// ─────────────────────────────────────────────────────────────

const CACHE_NAME = 'ryotei-shell-v1';

// プリキャッシュするアプリシェルのエントリー。
// expo export --platform web が生成するファイルに合わせています。
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── インストール ─────────────────────────────────────────────
// アプリシェルをキャッシュし、待機をスキップして即アクティブに。
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── アクティベート ──────────────────────────────────────────
// 旧バージョンのキャッシュを削除してクライアントを掌握。
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── フェッチ ────────────────────────────────────────────────
// キャッシュ優先（Cache First）→ ネットへフォールバック。
// GET 以外のリクエストはそのままネットへ流す。
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // 正常なレスポンス（200, same-origin）のみ動的キャッシュ。
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'opaque'
        ) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    }),
  );
});
