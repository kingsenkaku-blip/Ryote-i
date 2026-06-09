// iOS PWA インストール手順画面のルート。
// Web 専用のコンテンツですが、expo-router のルートとして通常通り登録します。
import { InstallGuideScreen } from '@/screens/InstallGuideScreen';

export default function InstallRoute() {
  return <InstallGuideScreen />;
}
