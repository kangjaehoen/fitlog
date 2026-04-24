import { getSettings } from "@/features/account/api";
import { SettingsScreen } from "@/features/account/components/settings-screen";

export const metadata = {
  title: "설정",
};

export default async function SettingPage() {
  const settings = await getSettings();

  return <SettingsScreen settings={settings} />;
}
