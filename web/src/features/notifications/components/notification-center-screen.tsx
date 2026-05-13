"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { markNotificationRead } from "../api";
import type { NotificationCenterData } from "../types";
import { NotificationBadgeIcon } from "./notification-badge-icon";

type NotificationCenterScreenProps = {
  data: NotificationCenterData;
};

function getNotificationClickHref(notificationId: string, actionHref?: string) {
  return actionHref ?? `/notifications/${notificationId}`;
}

export function NotificationCenterScreen({
  data,
}: NotificationCenterScreenProps) {
  const router = useRouter();

  async function handleNotificationClick(
    event: MouseEvent<HTMLAnchorElement>,
    notificationId: string,
    href: string,
  ) {
    event.preventDefault();

    try {
      await markNotificationRead(notificationId);
    } catch {
      // Navigation should still happen even if read-state sync fails.
    } finally {
      router.push(href);
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader
        title="알림함"
        fallbackHref="/main"
        trailing={
          data.unreadCount > 0 ? (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">
              {data.unreadCount} NEW
            </span>
          ) : null
        }
      />

      <main className="mx-auto flex max-w-md flex-col px-4 py-4 pb-10">
        {data.notifications.length > 0 ? (
          <section className="space-y-3">
            {data.notifications.map((notification) => {
              const href = getNotificationClickHref(
                notification.id,
                notification.actionHref,
              );

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={(event) =>
                    handleNotificationClick(event, notification.id, href)
                  }
                  className={`flex gap-3 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    notification.unread
                      ? "border-indigo-100 bg-white"
                      : "border-slate-100 bg-slate-100/70"
                  }`}
                >
                  <NotificationBadgeIcon
                    category={notification.category}
                    className={notification.unread ? "" : "opacity-70"}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`truncate text-sm font-black ${
                          notification.unread
                            ? "text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {notification.title}
                      </h2>
                      {notification.unread ? (
                        <span className="size-1.5 rounded-full bg-rose-500" />
                      ) : null}
                    </div>
                    <p
                      className={`mt-1 line-clamp-2 text-[12px] leading-5 ${
                        notification.unread ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <span
                      className={`text-[10px] font-bold ${
                        notification.unread ? "text-indigo-300" : "text-slate-300"
                      }`}
                    >
                      {notification.displayTime}
                    </span>
                    <ChevronRightIcon className="size-4 text-slate-300" />
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
            <h2 className="text-sm font-black text-slate-800">
              도착한 알림이 없습니다
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              브라우저 알림이 발송되면 이곳에 함께 표시됩니다.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
