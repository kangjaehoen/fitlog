import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getNotificationCenter } from "@/features/notifications/api";
import { NotificationCenterScreen } from "@/features/notifications/components/notification-center-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "알림함",
};

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const data = await getNotificationCenter(token);

  return <NotificationCenterScreen data={data} />;
}
