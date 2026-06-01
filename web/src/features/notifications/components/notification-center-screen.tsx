"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  SparklesIcon,
  UtensilsIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { markNotificationRead } from "../api";
import type { NotificationCategory, NotificationCenterData } from "../types";
import { NotificationBadgeIcon } from "./notification-badge-icon";

type NotificationCenterScreenProps = {
  data: NotificationCenterData;
};

type NotificationFilter = "all" | "unread" | NotificationCategory;

const categoryTone: Record<
  NotificationCategory,
  {
    label: string;
    chipClassName: string;
    iconClassName: string;
  }
> = {
  workout: {
    label: "운동",
    chipClassName: "bg-[#f1efff] text-[#6653e9]",
    iconClassName: "text-[#6653e9]",
  },
  meal: {
    label: "식단",
    chipClassName: "bg-emerald-50 text-emerald-600",
    iconClassName: "text-emerald-600",
  },
  system: {
    label: "시스템",
    chipClassName: "bg-slate-100 text-slate-500",
    iconClassName: "text-slate-500",
  },
};

function getNotificationClickHref(notificationId: string, actionHref?: string) {
  return actionHref ?? `/notifications/${notificationId}`;
}

function SummaryMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[12px] bg-white/15 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-1.5 text-white/70">
        {icon}
        <p className="text-[10px] font-bold leading-none">{label}</p>
      </div>
      <p className="text-[14px] font-black leading-tight text-white">{value}</p>
    </div>
  );
}

export function NotificationCenterScreen({
  data,
}: NotificationCenterScreenProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>("all");

  const counts = useMemo(() => {
    const categoryCounts = data.notifications.reduce(
      (acc, notification) => {
        acc[notification.category] += 1;
        return acc;
      },
      { meal: 0, system: 0, workout: 0 } satisfies Record<
        NotificationCategory,
        number
      >,
    );

    return {
      all: data.notifications.length,
      unread: data.unreadCount,
      ...categoryCounts,
    };
  }, [data.notifications, data.unreadCount]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return data.notifications;
    }

    if (activeFilter === "unread") {
      return data.notifications.filter((notification) => notification.unread);
    }

    return data.notifications.filter(
      (notification) => notification.category === activeFilter,
    );
  }, [activeFilter, data.notifications]);

  const filterTabs = [
    { key: "all", label: "전체", count: counts.all },
    { key: "unread", label: "새 알림", count: counts.unread },
    { key: "meal", label: "식단", count: counts.meal },
    { key: "workout", label: "운동", count: counts.workout },
    ...(counts.system > 0
      ? [{ key: "system" as const, label: "시스템", count: counts.system }]
      : []),
  ] satisfies Array<{
    key: NotificationFilter;
    label: string;
    count: number;
  }>;

  const latestNotification = data.notifications[0];

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
    <div className="min-h-screen bg-[#f8f8ff]">
      <StackHeader
        title="알림함"
        fallbackHref="/main"
        trailing={
          data.unreadCount > 0 ? (
            <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black text-[#6653e9]">
              {data.unreadCount} NEW
            </span>
          ) : null
        }
      />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-10 pt-3">
        <section className="relative overflow-hidden rounded-[14px] px-5 py-[18px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_25%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-4 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <BellIcon className="size-12" />
          </div>

          <div className="relative max-w-[250px]">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              NOTIFICATIONS
            </p>
            <h2 className="mt-2 text-[22px] font-black leading-tight">
              기록 타이밍을 놓치지 않게
            </h2>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
              운동과 식단 리마인더를 한곳에서 확인하고 바로 기록으로 이어가요.
            </p>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <SummaryMetric
              label="새 알림"
              value={`${counts.unread}개`}
              icon={<BellIcon className="size-3" />}
            />
            <SummaryMetric
              label="전체"
              value={`${counts.all}개`}
              icon={<CheckCircleIcon className="size-3" />}
            />
            <SummaryMetric
              label="최근 수신"
              value={latestNotification?.displayTime || "-"}
              icon={<ClockIcon className="size-3" />}
            />
          </div>
        </section>

        <section className="rounded-[14px] border border-[#edf0ff] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-[14px] font-black leading-none text-[#11172f]">
                알림 메시지
              </h2>
              <p className="mt-1.5 text-[11px] font-semibold leading-4 text-[#9299b2]">
                필요한 메시지만 빠르게 골라볼 수 있어요.
              </p>
            </div>
            <span className="rounded-full bg-[#faf9ff] px-2.5 py-1 text-[10px] font-black text-[#6653e9] ring-1 ring-[#ece8ff]">
              {filteredNotifications.length}개
            </span>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filterTabs.map((tab) => {
              const active = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-black transition active:scale-[0.98] ${
                    active
                      ? "bg-[#6653e9] text-white shadow-[0_8px_18px_rgba(102,83,233,0.22)]"
                      : "bg-[#f6f7fb] text-[#7380ad]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                      active ? "bg-white/20 text-white" : "bg-white text-[#9299b2]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {filteredNotifications.length > 0 ? (
          <section className="space-y-2.5">
            {filteredNotifications.map((notification) => {
              const href = getNotificationClickHref(
                notification.id,
                notification.actionHref,
              );
              const tone = categoryTone[notification.category];

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={(event) =>
                    handleNotificationClick(event, notification.id, href)
                  }
                  className={`group relative flex gap-3 overflow-hidden rounded-[14px] border px-4 py-3.5 shadow-[0_10px_24px_rgba(37,45,100,0.06)] transition active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,45,100,0.09)] ${
                    notification.unread
                      ? "border-[#d8d3ff] bg-white"
                      : "border-[#edf0ff] bg-white/75"
                  }`}
                >
                  {notification.unread ? (
                    <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#6653e9]" />
                  ) : null}
                  <NotificationBadgeIcon
                    category={notification.category}
                    className={`size-11 rounded-[14px] ${
                      notification.unread ? "" : "opacity-70"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${tone.chipClassName}`}
                      >
                        {tone.label}
                      </span>
                      {notification.unread ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-500">
                          NEW
                        </span>
                      ) : null}
                    </div>
                    <h3
                      className={`line-clamp-1 text-[14px] font-black leading-5 ${
                        notification.unread ? "text-[#11172f]" : "text-[#667085]"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p
                      className={`mt-1 line-clamp-2 text-[12px] font-semibold leading-5 ${
                        notification.unread ? "text-[#64748b]" : "text-[#a0a7ba]"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#9299b2]">
                      <ClockIcon className="size-3.5" />
                      <span>{notification.displayTime || "방금"}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center">
                    <ChevronRightIcon
                      className={`size-4 transition group-hover:translate-x-0.5 ${tone.iconClassName}`}
                    />
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[14px] border border-dashed border-[#d8d3ff] bg-white px-5 py-10 text-center shadow-[0_10px_24px_rgba(37,45,100,0.06)]">
            <span className="mx-auto grid size-12 place-items-center rounded-[16px] bg-[#f1efff] text-[#6653e9]">
              {data.notifications.length > 0 ? (
                activeFilter === "meal" ? (
                  <UtensilsIcon className="size-6" />
                ) : activeFilter === "workout" ? (
                  <DumbbellIcon className="size-6" />
                ) : (
                  <SparklesIcon className="size-6" />
                )
              ) : (
                <BellIcon className="size-6" />
              )}
            </span>
            <h2 className="mt-4 text-[14px] font-black text-[#11172f]">
              {data.notifications.length > 0
                ? "조건에 맞는 알림이 없어요"
                : "도착한 알림이 없습니다"}
            </h2>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9299b2]">
              {data.notifications.length > 0
                ? "다른 분류를 선택하면 이전 메시지를 다시 볼 수 있어요."
                : "브라우저 알림이 발송되면 이곳에 함께 표시됩니다."}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
