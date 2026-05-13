import { apiClient } from "@/lib/api-client";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import type {
  NotificationCategory,
  NotificationCenterData,
  NotificationItem,
} from "./types";

type NotificationScheduleStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

type NotificationSchedule = {
  id: number;
  title: string;
  body: string;
  targetUrl: string;
  scheduledAt: string;
  status: NotificationScheduleStatus;
  sentAt: string | null;
  readAt: string | null;
  retryCount: number;
};

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getPersistedAuthHeaders() {
  const token = getPersistedAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

function getNotificationCategory(schedule: NotificationSchedule): NotificationCategory {
  const searchText = `${schedule.title} ${schedule.body} ${schedule.targetUrl}`;

  if (searchText.includes("식단") || schedule.targetUrl.includes("meal")) {
    return "meal";
  }

  if (
    searchText.includes("운동") ||
    schedule.targetUrl.includes("workout") ||
    schedule.targetUrl.includes("routine")
  ) {
    return "workout";
  }

  return "system";
}

function getActionLabel(category: NotificationCategory) {
  switch (category) {
    case "meal":
      return "식단 기록";
    case "workout":
      return "운동 기록";
    default:
      return "확인하기";
  }
}

function getActionHref(category: NotificationCategory) {
  switch (category) {
    case "meal":
      return "/today-meal-log";
    case "workout":
      return "/today-workout-log";
    default:
      return "/notifications";
  }
}

function formatDisplayTime(receivedAt: string) {
  const date = new Date(receivedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === today) {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "어제";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toNotificationItem(schedule: NotificationSchedule): NotificationItem {
  const category = getNotificationCategory(schedule);
  const receivedAt = schedule.sentAt ?? schedule.scheduledAt;

  return {
    id: String(schedule.id),
    category,
    title: schedule.title,
    message: schedule.body,
    detail: schedule.body,
    receivedAt,
    displayTime: formatDisplayTime(receivedAt),
    unread: schedule.readAt === null,
    actionLabel: getActionLabel(category),
    actionHref: getActionHref(category),
  };
}

export async function getNotificationCenter(
  token: string,
): Promise<NotificationCenterData> {
  const schedules = await apiClient.get<NotificationSchedule[]>(
    "/api/notifications/schedules?status=SENT",
    {
      cache: "no-store",
      headers: getAuthHeaders(token),
    },
  );
  const notifications = schedules.map(toNotificationItem);

  return {
    unreadCount: notifications.filter((item) => item.unread).length,
    notifications,
  };
}

export async function getNotificationDetail(
  token: string,
  notificationId: string,
): Promise<NotificationItem | null> {
  try {
    const schedule = await apiClient.get<NotificationSchedule>(
      `/api/notifications/schedules/${notificationId}`,
      {
        cache: "no-store",
        headers: getAuthHeaders(token),
      },
    );

    if (schedule.status !== "SENT") {
      return null;
    }

    const readSchedule = schedule.readAt
      ? schedule
      : await apiClient.patch<NotificationSchedule>(
          `/api/notifications/schedules/${notificationId}/read`,
          undefined,
          {
            cache: "no-store",
            headers: getAuthHeaders(token),
          },
        );

    return toNotificationItem(readSchedule);
  } catch {
    return null;
  }
}

export async function markNotificationRead(notificationId: string) {
  return apiClient.patch<NotificationSchedule>(
    `/api/notifications/schedules/${notificationId}/read`,
    undefined,
    {
      cache: "no-store",
      headers: getPersistedAuthHeaders(),
    },
  );
}
