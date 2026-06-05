// 旅程詳細ルート（/trip/<id>）
import { useLocalSearchParams } from 'expo-router';
import { DetailScreen } from '@/screens/DetailScreen';

export default function TripDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetailScreen tripId={id} />;
}
