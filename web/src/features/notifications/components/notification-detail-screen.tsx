import Link from "next/link";
import { ClockIcon, InfoIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { NotificationItem } from "../types";
import {
  NotificationBadgeIcon,
  NotificationStatusIcon,
} from "./notification-badge-icon";

type NotificationDetailScreenProps = {
  notification: NotificationItem;
};

const categoryLabel = {
  workout: "운동 알림",
  meal: "식단 알림",
  system: "시스템 알림",
};

export function NotificationDetailScreen({
  notification,
}: NotificationDetailScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="알림 상세" fallbackHref="/notifications" />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4 pb-10">
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 text-center shadow-sm">
          <NotificationBadgeIcon
            category={notification.category}
            className="mx-auto size-14 rounded-2xl"
          />
          <p className="mt-4 text-xs font-black text-indigo-600">
            {categoryLabel[notification.category]}
          </p>
          <h1 className="mt-3 text-xl font-black leading-7 text-slate-900">
            {notification.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {notification.detail}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <NotificationStatusIcon unread={notification.unread} />
            <div>
              <p className="text-xs font-black text-slate-800">
                {notification.unread ? "읽지 않은 알림" : "확인한 알림"}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                알림함에서 다시 확인할 수 있어요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <span className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-500">
              <ClockIcon className="size-4" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">수신 시간</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {notification.receivedAt.replace("T", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <p className="text-[11px] leading-5 text-slate-500">
              알림은 브라우저로 발송된 뒤 알림함에 표시됩니다.
            </p>
          </div>
        </section>

        {notification.actionHref && notification.actionLabel ? (
          <Link
            href={notification.actionHref}
            className="mt-2 flex items-center justify-center rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-100"
          >
            {notification.actionLabel}
          </Link>
        ) : null}
      </main>
    </div>
  );
}
