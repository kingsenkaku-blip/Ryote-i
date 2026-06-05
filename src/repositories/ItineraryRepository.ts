// ─────────────────────────────────────────────────────────────
// 旅程リポジトリ（インターフェース）
//
// 永続化の「契約」を定義します。UI 層はこのインターフェースだけに依存し、
// AsyncStorage / Supabase などの実装の詳細は知りません。
//
//   現在 : AsyncStorageItineraryRepository（端末内に保存）
//   将来 : SupabaseItineraryRepository（クラウド同期・共有）
//
// 差し替えは src/repositories/index.ts の 1 行を変えるだけで済みます。
// ─────────────────────────────────────────────────────────────
import type { Trip } from '@/types';

export interface ItineraryRepository {
  /** すべての旅程を取得します。 */
  getAll(): Promise<Trip[]>;

  /** ID で 1 件取得します。なければ null。 */
  getById(id: string): Promise<Trip | null>;

  /** 旅程を保存します（同じ ID があれば置き換え、なければ追加）。 */
  save(trip: Trip): Promise<Trip>;

  /** 旅程を部分更新します。updatedAt は実装側で自動更新します。 */
  update(id: string, patch: Partial<Trip>): Promise<Trip>;

  /** 旅程を削除します。 */
  delete(id: string): Promise<void>;
}
