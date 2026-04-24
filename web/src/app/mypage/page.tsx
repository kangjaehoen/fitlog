import { getProfileScreen } from "@/features/account/api";
import { ProfileScreen } from "@/features/account/components/profile-screen";

export const metadata = {
  title: "마이 페이지",
};

export default async function MyPage() {
  const profile = await getProfileScreen();

  return <ProfileScreen profile={profile} />;
}
