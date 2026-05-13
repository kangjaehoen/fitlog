import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getNotificationDetail } from "@/features/notifications/api";
import { NotificationDetailScreen } from "@/features/notifications/components/notification-detail-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

type NotificationDetailPageProps = {
  params: Promise<{
    notificationId: string;
  }>;
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export const metadata = {
  title: "알림 상세",
};

export default async function NotificationDetailPage({
  params,
  searchParams,
}: NotificationDetailPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const { notificationId } = await params;
  const { redirect: shouldRedirect } = await searchParams;
  const notification = await getNotificationDetail(token, notificationId);

  if (!notification) {
    notFound();
  }

  if (shouldRedirect === "1" && notification.actionHref) {
    redirect(notification.actionHref);
  }

  return <NotificationDetailScreen notification={notification} />;
}
