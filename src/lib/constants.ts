// ─────────────────────────────────────────────────────────────
// 予定種別のラベルとアイコン対応（design_reference の KIND を移植）
// ─────────────────────────────────────────────────────────────
import type { ItemKind } from '@/types';
import type { IconName } from '@/components/icons';

export interface KindMeta {
  label: string;
  /** タイムラインのアイコン名（components/icons.tsx）。 */
  icon: IconName;
}

export const KIND: Record<ItemKind, KindMeta> = {
  depart: { label: '出発', icon: 'home' },
  transit: { label: '移動', icon: 'train' },
  arrive: { label: '到着', icon: 'pin' },
  checkin: { label: 'チェックイン', icon: 'bed' },
  checkout: { label: 'チェックアウト', icon: 'bed' },
  meet: { label: '予定', icon: 'dot' },
  food: { label: '食事', icon: 'cup' },
  sight: { label: '観光', icon: 'star' },
};

/** タイムラインで「塗りつぶしノード」にする主要な移動系種別。 */
export const FILLED_KINDS: ItemKind[] = ['transit', 'depart', 'checkin', 'checkout'];
