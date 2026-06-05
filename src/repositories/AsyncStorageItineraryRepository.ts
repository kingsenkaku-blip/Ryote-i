// ─────────────────────────────────────────────────────────────
// 旅程リポジトリ（AsyncStorage 実装）
//
// 端末内（AsyncStorage）に全旅程を 1 つの JSON 配列として保存します。
// これが初期実装です。将来 Supabase 実装に差し替え可能です。
// ─────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip } from '@/types';
import type { ItineraryRepository } from './ItineraryRepository';

/** 保存キー（バージョン付き。スキーマ変更時に番号を上げます）。 */
const STORAGE_KEY = 'ryotei:trips:v1';

export class AsyncStorageItineraryRepository implements ItineraryRepository {
  private async readAll(): Promise<Trip[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Trip[]) : [];
    } catch {
      // 壊れたデータは握りつぶして空配列を返す（起動を止めない）。
      return [];
    }
  }

  private async writeAll(trips: Trip[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }

  async getAll(): Promise<Trip[]> {
    return this.readAll();
  }

  async getById(id: string): Promise<Trip | null> {
    const all = await this.readAll();
    return all.find((t) => t.id === id) ?? null;
  }

  async save(trip: Trip): Promise<Trip> {
    const all = await this.readAll();
    const idx = all.findIndex((t) => t.id === trip.id);
    if (idx >= 0) {
      all[idx] = trip;
    } else {
      all.push(trip);
    }
    await this.writeAll(all);
    return trip;
  }

  async update(id: string, patch: Partial<Trip>): Promise<Trip> {
    const all = await this.readAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx < 0) {
      throw new Error(`Trip not found: ${id}`);
    }
    const updated: Trip = {
      ...all[idx],
      ...patch,
      id, // ID は不変
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    await this.writeAll(all);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const all = await this.readAll();
    await this.writeAll(all.filter((t) => t.id !== id));
  }
}
