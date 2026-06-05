// ─────────────────────────────────────────────────────────────
// 旅程（Trips）のグローバル状態
//
// 起動時に ItineraryRepository から全旅程を読み込み、作成・編集・削除・
// 複製・アーカイブ・持ち物管理を提供します。
// すべての保存はリポジトリ経由（UI から AsyncStorage を直接触らない）。
// ─────────────────────────────────────────────────────────────
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ItineraryItem, PackingItem, Scope, Severity, Stay, Trip } from '@/types';
import { itineraryRepository } from '@/repositories';
import { generateId } from '@/lib/id';

/** 新規旅程の作成に必要な入力（システム項目は自動付与）。 */
export interface NewTripInput {
  title: string;
  place: string;
  scope: Scope;
  severity: Severity;
  packing: boolean;
  start: string;
  end: string;
  stay: Stay | null;
  items: ItineraryItem[];
  packingList?: PackingItem[];
  notificationsEnabled?: boolean;
}

interface TripsContextValue {
  trips: Trip[];
  loading: boolean;
  getTrip: (id: string) => Trip | undefined;
  addTrip: (input: NewTripInput) => Promise<Trip>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  duplicateTrip: (id: string) => Promise<Trip | undefined>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
  // 持ち物チェックリスト
  addPackingItem: (tripId: string, label: string) => Promise<void>;
  editPackingItem: (tripId: string, itemId: string, label: string) => Promise<void>;
  togglePackingItem: (tripId: string, itemId: string) => Promise<void>;
  deletePackingItem: (tripId: string, itemId: string) => Promise<void>;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // 初回読み込み。
  useEffect(() => {
    let active = true;
    itineraryRepository.getAll().then((all) => {
      if (active) {
        setTrips(all);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const addTrip = useCallback(async (input: NewTripInput) => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: generateId('trip'),
      title: input.title,
      place: input.place,
      scope: input.scope,
      severity: input.severity,
      packing: input.packing,
      start: input.start,
      end: input.end,
      stay: input.stay,
      items: input.items,
      packingList: input.packingList ?? [],
      notificationsEnabled: input.notificationsEnabled ?? true,
      archived: false,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    await itineraryRepository.save(trip);
    setTrips((prev) => [...prev, trip]);
    return trip;
  }, []);

  const updateTrip = useCallback(async (id: string, patch: Partial<Trip>) => {
    const updated = await itineraryRepository.update(id, patch);
    setTrips((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    await itineraryRepository.delete(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const duplicateTrip = useCallback(
    async (id: string) => {
      const original = trips.find((t) => t.id === id);
      if (!original) return undefined;
      const now = new Date().toISOString();
      const copy: Trip = {
        ...original,
        id: generateId('trip'),
        title: `${original.title}（コピー）`,
        // ID は配列内で一意になるよう振り直す。
        items: original.items.map((it) => ({ ...it, id: generateId('item') })),
        packingList: original.packingList.map((p) => ({ ...p, id: generateId('pack') })),
        archived: false,
        createdAt: now,
        updatedAt: now,
      };
      await itineraryRepository.save(copy);
      setTrips((prev) => [...prev, copy]);
      return copy;
    },
    [trips],
  );

  const setArchived = useCallback(
    (id: string, archived: boolean) => updateTrip(id, { archived }),
    [updateTrip],
  );

  // ── 持ち物チェックリスト ──────────────────────────────────
  const mutatePacking = useCallback(
    async (tripId: string, fn: (list: PackingItem[]) => PackingItem[]) => {
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) return;
      await updateTrip(tripId, { packingList: fn(trip.packingList) });
    },
    [trips, updateTrip],
  );

  const addPackingItem = useCallback(
    (tripId: string, label: string) =>
      mutatePacking(tripId, (list) => [
        ...list,
        { id: generateId('pack'), label: label.trim(), done: false },
      ]),
    [mutatePacking],
  );

  const editPackingItem = useCallback(
    (tripId: string, itemId: string, label: string) =>
      mutatePacking(tripId, (list) =>
        list.map((p) => (p.id === itemId ? { ...p, label: label.trim() } : p)),
      ),
    [mutatePacking],
  );

  const togglePackingItem = useCallback(
    (tripId: string, itemId: string) =>
      mutatePacking(tripId, (list) =>
        list.map((p) => (p.id === itemId ? { ...p, done: !p.done } : p)),
      ),
    [mutatePacking],
  );

  const deletePackingItem = useCallback(
    (tripId: string, itemId: string) =>
      mutatePacking(tripId, (list) => list.filter((p) => p.id !== itemId)),
    [mutatePacking],
  );

  const value = useMemo<TripsContextValue>(
    () => ({
      trips,
      loading,
      getTrip,
      addTrip,
      updateTrip,
      deleteTrip,
      duplicateTrip,
      setArchived,
      addPackingItem,
      editPackingItem,
      togglePackingItem,
      deletePackingItem,
    }),
    [
      trips,
      loading,
      getTrip,
      addTrip,
      updateTrip,
      deleteTrip,
      duplicateTrip,
      setArchived,
      addPackingItem,
      editPackingItem,
      togglePackingItem,
      deletePackingItem,
    ],
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

/** 旅程ストアにアクセスするフック。 */
export function useTrips(): TripsContextValue {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
