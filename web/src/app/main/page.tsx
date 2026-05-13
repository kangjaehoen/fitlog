import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getHomeDashboard } from "@/features/home/api";
import { HomeScreen } from "@/features/home/components/home-screen";
import { getNotificationCenter } from "@/features/notifications/api";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "메인",
};

export default async function MainPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const [dashboard, notificationCenter] = await Promise.all([
    getHomeDashboard(token),
    getNotificationCenter(token).catch(() => ({
      notifications: [],
      unreadCount: 0,
    })),
  ]);

  return (
    <HomeScreen
      dashboard={dashboard}
      unreadNotificationCount={notificationCenter.unreadCount}
    />
  );
}
