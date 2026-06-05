// ─────────────────────────────────────────────────────────────
// リポジトリの実体を 1 か所で決める場所。
//
// 将来 Supabase に切り替えるときは、ここで生成するクラスを
// SupabaseItineraryRepository に差し替えるだけです（UI 層は無変更）。
// ─────────────────────────────────────────────────────────────
import { AsyncStorageItineraryRepository } from './AsyncStorageItineraryRepository';
import type { ItineraryRepository } from './ItineraryRepository';

export type { ItineraryRepository } from './ItineraryRepository';

/** アプリ全体で使う旅程リポジトリのシングルトン。 */
export const itineraryRepository: ItineraryRepository = new AsyncStorageItineraryRepository();
