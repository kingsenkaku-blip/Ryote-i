// 簡易 ID 生成（時刻 + ランダム）。衝突確率は実用上無視できます。
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
