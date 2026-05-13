import { getPersistedAuthToken } from "@/features/account/auth-session";
import { apiClient } from "@/lib/api-client";
import type {
  PushSubscriptionPayload,
  VapidPublicKeyResponse,
} from "./types";

export type NotificationScheduleStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

export type NotificationSchedulePayload = {
  title: string;
  body: string;
  scheduledAt: string;
  targetUrl?: string;
};

export type NotificationSchedule = NotificationSchedulePayload & {
  id: number;
  targetUrl: string;
  status: NotificationScheduleStatus;
  sentAt: string | null;
  readAt: string | null;
  retryCount: number;
};

function getAuthHeaders() {
  const token = getPersistedAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;
}

export async function getVapidPublicKey() {
  const response = await apiClient.get<VapidPublicKeyResponse | string>(
    "/api/push/vapid-public-key",
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );

  if (typeof response === "string") {
    return response;
  }

  const publicKey = response.publicKey ?? response.vapidPublicKey;

  if (!publicKey) {
    throw new Error("VAPID public key is missing.");
  }

  return publicKey;
}

export async function savePushSubscription(payload: PushSubscriptionPayload) {
  return apiClient.post<{ success: boolean }>(
    "/api/push/subscriptions",
    payload,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );
}

export async function deletePushSubscription(
  payload: Pick<PushSubscriptionPayload, "endpoint">,
) {
  return apiClient.delete<{ success: boolean }>(
    "/api/push/subscriptions",
    payload,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );
}

export async function getNotificationSchedules(
  status?: NotificationScheduleStatus,
) {
  const query = status ? `?status=${status}` : "";

  return apiClient.get<NotificationSchedule[]>(
    `/api/notifications/schedules${query}`,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );
}

export async function createNotificationSchedule(
  payload: NotificationSchedulePayload,
) {
  return apiClient.post<NotificationSchedule>(
    "/api/notifications/schedules",
    payload,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );
}

export async function cancelNotificationSchedule(scheduleId: number) {
  return apiClient.patch<NotificationSchedule>(
    `/api/notifications/schedules/${scheduleId}/cancel`,
    undefined,
    {
      cache: "no-store",
      headers: getAuthHeaders(),
    },
  );
}
