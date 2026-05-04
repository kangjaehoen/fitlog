import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileScreen } from "@/features/account/api";
import { ProfileScreen } from "@/features/account/components/profile-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "마이 페이지",
};

export default async function MyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const profile = await getProfileScreen(token);

  return <ProfileScreen profile={profile} />;
}
