import {
  BellIcon,
  DumbbellIcon,
  ShieldIcon,
  UtensilsIcon,
} from "@/components/icons";
import type { NotificationCategory } from "../types";

type NotificationBadgeIconProps = {
  category: NotificationCategory;
  className?: string;
};

const categoryStyle: Record<NotificationCategory, string> = {
  workout: "bg-indigo-600 text-white",
  meal: "bg-emerald-500 text-white",
  system: "bg-slate-100 text-slate-500",
};

export function NotificationBadgeIcon({
  category,
  className = "",
}: NotificationBadgeIconProps) {
  const Icon =
    category === "workout"
      ? DumbbellIcon
      : category === "meal"
        ? UtensilsIcon
        : ShieldIcon;

  return (
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${categoryStyle[category]} ${className}`}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function NotificationStatusIcon({ unread }: { unread: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
        unread ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
      }`}
    >
      <BellIcon className="size-4" />
    </span>
  );
}
