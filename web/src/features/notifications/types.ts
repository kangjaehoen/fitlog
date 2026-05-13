export type NotificationCategory = "workout" | "meal" | "system";

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  detail: string;
  receivedAt: string;
  displayTime: string;
  unread: boolean;
  actionLabel?: string;
  actionHref?: string;
};

export type NotificationCenterData = {
  unreadCount: number;
  notifications: NotificationItem[];
};
