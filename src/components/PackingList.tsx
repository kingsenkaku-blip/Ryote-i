// ─────────────────────────────────────────────────────────────
// 持ち物チェックリスト（旅程詳細内）
//   ・追加 / 編集 / 削除 / チェック完了
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { PackingItem } from '@/types';
import { useColors } from '@/store/ThemeContext';
import { useTrips } from '@/store/TripsContext';
import { Icon } from './icons';

export function PackingList({ tripId, items }: { tripId: string; items: PackingItem[] }) {
  const c = useColors();
  const { addPackingItem, editPackingItem, togglePackingItem, deletePackingItem } = useTrips();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const doneCount = items.filter((i) => i.done).length;

  const submitNew = () => {
    const label = draft.trim();
    if (!label) return;
    void addPackingItem(tripId, label);
    setDraft('');
  };

  const startEdit = (item: PackingItem) => {
    setEditingId(item.id);
    setEditText(item.label);
  };

  const commitEdit = () => {
    if (editingId && editText.trim()) {
      void editPackingItem(tripId, editingId, editText);
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 16, padding: 6 }}>
      {items.length > 0 ? (
        <Text style={{ fontSize: 11, color: c.ink3, paddingHorizontal: 10, paddingTop: 6 }}>
          {doneCount}/{items.length} 完了
        </Text>
      ) : null}

      {items.map((item, i) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 11,
            paddingHorizontal: 10,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: c.line,
          }}
        >
          {/* チェックボックス */}
          <Pressable
            onPress={() => togglePackingItem(tripId, item.id)}
            hitSlop={6}
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              borderWidth: 1.6,
              borderColor: item.done ? c.accent : c.lineStrong,
              backgroundColor: item.done ? c.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.done ? <Icon name="check" size={15} color={c.accentInk} strokeWidth={2.2} /> : null}
          </Pressable>

          {/* ラベル（編集中は入力欄） */}
          {editingId === item.id ? (
            <TextInput
              value={editText}
              onChangeText={setEditText}
              onBlur={commitEdit}
              onSubmitEditing={commitEdit}
              autoFocus
              style={{ flex: 1, fontSize: 15, color: c.ink, paddingVertical: 0 }}
            />
          ) : (
            <Pressable style={{ flex: 1 }} onPress={() => startEdit(item)}>
              <Text
                style={{
                  fontSize: 15,
                  color: item.done ? c.ink3 : c.ink,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          )}

          {/* 編集・削除 */}
          <Pressable onPress={() => startEdit(item)} hitSlop={6}>
            <Icon name="edit" size={17} color={c.ink3} />
          </Pressable>
          <Pressable onPress={() => deletePackingItem(tripId, item.id)} hitSlop={6}>
            <Icon name="trash" size={17} color={c.ink3} />
          </Pressable>
        </View>
      ))}

      {/* 追加行 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderTopWidth: items.length === 0 ? 0 : 1,
          borderTopColor: c.line,
        }}
      >
        <Icon name="plus" size={18} color={c.ink3} />
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submitNew}
          placeholder="持ち物を追加（例: パスポート）"
          placeholderTextColor={c.ink3}
          returnKeyType="done"
          style={{ flex: 1, fontSize: 15, color: c.ink, paddingVertical: 0 }}
        />
        {draft.trim() ? (
          <Pressable onPress={submitNew} hitSlop={6}>
            <Text style={{ color: c.accent, fontSize: 14, fontWeight: '600' }}>追加</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
