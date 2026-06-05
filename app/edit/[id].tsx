// 旅程編集ルート（/edit/<id>）
import { useLocalSearchParams } from 'expo-router';
import { AddScreen } from '@/screens/AddScreen';

export default function EditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AddScreen mode="edit" tripId={id} />;
}
