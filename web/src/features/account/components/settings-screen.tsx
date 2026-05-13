"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  HelpCircleIcon,
  InfoIcon,
  LogOutIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
  UtensilsIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  cancelNotificationSchedule,
  createNotificationSchedule,
  getNotificationSchedules,
  type NotificationSchedule,
  type NotificationSchedulePayload,
} from "@/features/push/api";
import { usePushNotification } from "@/features/push/use-push-notification";
import { clearAuthSession } from "../auth-session";
import { logout } from "../api";
import type { SettingsData } from "../types";

type SettingsScreenProps = {
  settings: SettingsData;
};

type ReminderTime = {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
  removable?: boolean;
};

type WorkoutReminderTime = ReminderTime & {
  leadMinutes: string;
  activeDays: string[];
};

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];
const jsWeekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
const scheduleLookaheadDays = 7;
const mealTargetUrl = "/today-meal-log";
const workoutTargetUrl = "/today-workout-log";
const legacyWorkoutTargetUrl = "/fitness-routine";
const managedReminderTargetUrls = new Set([
  mealTargetUrl,
  workoutTargetUrl,
  legacyWorkoutTargetUrl,
]);
const reminderPreferencesStorageKey = "fitlog.reminder-preferences.v1";

const initialMealReminderTimes: ReminderTime[] = [
  { id: "meal-breakfast", label: "아침", time: "08:00", enabled: true },
  { id: "meal-lunch", label: "점심", time: "12:30", enabled: true },
  { id: "meal-dinner", label: "저녁", time: "19:00", enabled: true },
  { id: "meal-snack", label: "간식", time: "15:30", enabled: true },
];

const initialWorkoutReminderTimes: WorkoutReminderTime[] = [
  {
    id: "workout-1",
    label: "운동 1",
    time: "18:30",
    enabled: true,
    leadMinutes: "30",
    activeDays: weekdayLabels,
  },
];

type ReminderPreferences = {
  notificationMap: Record<string, boolean>;
  mealReminderTimes: ReminderTime[];
  workoutReminderTimes: WorkoutReminderTime[];
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
      {children}
    </h2>
  );
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes =
    ((hours * 60 + minutes + minutesToAdd) % (24 * 60) + 24 * 60) %
    (24 * 60);
  const nextHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const nextMinutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${nextHours}:${nextMinutes}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function dateAtTime(baseDate: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function formatLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

function formatLeadMinutes(value: string) {
  const minutes = Number(value);

  if (minutes === 60) {
    return "1시간";
  }

  return `${minutes}분`;
}

function parseScheduleDateTime(value: string) {
  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  const [datePart, timePart = "00:00:00"] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatTimeFromDate(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function getMealReminderLabel(schedule: NotificationSchedule) {
  return schedule.title.replace(/\s*식단 기록 알림$/, "").trim() || "식단";
}

function getWorkoutReminderLabel(schedule: NotificationSchedule) {
  return schedule.title.replace(/\s*운동 알림$/, "").trim() || "운동";
}

function getWorkoutLeadMinutes(schedule: NotificationSchedule) {
  if (schedule.body.includes("1시간")) {
    return "60";
  }

  const match = schedule.body.match(/(\d+)분/);

  return match?.[1] ?? "30";
}

function getSchedulesByTargetUrl(
  schedules: NotificationSchedule[],
  targetUrl: string,
) {
  return schedules.filter((schedule) => schedule.targetUrl === targetUrl);
}

function getWorkoutSchedules(schedules: NotificationSchedule[]) {
  return schedules.filter(
    (schedule) =>
      schedule.targetUrl === workoutTargetUrl ||
      schedule.targetUrl === legacyWorkoutTargetUrl,
  );
}

function restoreMealReminderTimes(schedules: NotificationSchedule[]) {
  const schedulesByLabel = new Map<string, string>();

  schedules.forEach((schedule) => {
    const label = getMealReminderLabel(schedule);
    const time = formatTimeFromDate(parseScheduleDateTime(schedule.scheduledAt));

    if (!schedulesByLabel.has(label)) {
      schedulesByLabel.set(label, time);
    }
  });

  const defaultLabels = new Set(
    initialMealReminderTimes.map((reminder) => reminder.label),
  );
  const restoredDefaults = initialMealReminderTimes.map((reminder) => {
    const restoredTime = schedulesByLabel.get(reminder.label);

    return {
      ...reminder,
      time: restoredTime ?? reminder.time,
      enabled: Boolean(restoredTime),
    };
  });
  const restoredCustoms = [...schedulesByLabel.entries()]
    .filter(([label]) => !defaultLabels.has(label))
    .map(([label, time], index) => ({
      id: `meal-restored-${index + 1}`,
      label,
      time,
      enabled: true,
      removable: true,
    }));

  return [...restoredDefaults, ...restoredCustoms];
}

function restoreWorkoutReminderTimes(schedules: NotificationSchedule[]) {
  const schedulesByLabel = new Map<
    string,
    {
      activeDays: Set<string>;
      leadMinutes: string;
      time: string;
    }
  >();

  schedules.forEach((schedule) => {
    const label = getWorkoutReminderLabel(schedule);
    const leadMinutes = getWorkoutLeadMinutes(schedule);
    const workoutAt = new Date(
      parseScheduleDateTime(schedule.scheduledAt).getTime() +
        Number(leadMinutes) * 60_000,
    );
    const day = jsWeekdayLabels[workoutAt.getDay()];
    const previous = schedulesByLabel.get(label);

    if (previous) {
      previous.activeDays.add(day);
      return;
    }

    schedulesByLabel.set(label, {
      activeDays: new Set([day]),
      leadMinutes,
      time: formatTimeFromDate(workoutAt),
    });
  });

  const restored = [...schedulesByLabel.entries()]
    .sort(([leftLabel], [rightLabel]) =>
      leftLabel.localeCompare(rightLabel, "ko", { numeric: true }),
    )
    .map(([label, reminder], index) => ({
      id: index === 0 ? "workout-1" : `workout-restored-${index + 1}`,
      label,
      time: reminder.time,
      enabled: true,
      leadMinutes: reminder.leadMinutes,
      activeDays: weekdayLabels.filter((day) => reminder.activeDays.has(day)),
      removable: index > 0,
    }));

  return restored.length > 0 ? restored : initialWorkoutReminderTimes;
}

function isReminderTime(value: unknown): value is ReminderTime {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ReminderTime;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.time === "string" &&
    typeof candidate.enabled === "boolean"
  );
}

function isWorkoutReminderTime(value: unknown): value is WorkoutReminderTime {
  if (!isReminderTime(value)) {
    return false;
  }

  const candidate = value as Partial<WorkoutReminderTime>;

  return (
    typeof candidate.leadMinutes === "string" &&
    Array.isArray(candidate.activeDays) &&
    candidate.activeDays.every((day) => typeof day === "string")
  );
}

function readReminderPreferences() {
  try {
    const rawPreferences = window.localStorage.getItem(
      reminderPreferencesStorageKey,
    );

    if (!rawPreferences) {
      return null;
    }

    const preferences = JSON.parse(rawPreferences) as Partial<ReminderPreferences>;

    return {
      notificationMap:
        preferences.notificationMap &&
        typeof preferences.notificationMap === "object"
          ? preferences.notificationMap
          : undefined,
      mealReminderTimes: Array.isArray(preferences.mealReminderTimes)
        ? preferences.mealReminderTimes.filter(isReminderTime)
        : undefined,
      workoutReminderTimes: Array.isArray(preferences.workoutReminderTimes)
        ? preferences.workoutReminderTimes.filter(isWorkoutReminderTime)
        : undefined,
    };
  } catch {
    return null;
  }
}

function writeReminderPreferences(preferences: ReminderPreferences) {
  try {
    window.localStorage.setItem(
      reminderPreferencesStorageKey,
      JSON.stringify(preferences),
    );
  } catch {
    // Saving the server schedule is the source of truth; local storage only improves UI restoration.
  }
}

function buildMealSchedulePayloads(reminders: ReminderTime[]) {
  const now = new Date();
  const payloads: NotificationSchedulePayload[] = [];

  for (let dayOffset = 0; dayOffset < scheduleLookaheadDays; dayOffset += 1) {
    const baseDate = addDays(now, dayOffset);

    reminders
      .filter((reminder) => reminder.enabled)
      .forEach((reminder) => {
        const scheduledAt = dateAtTime(baseDate, reminder.time);

        if (scheduledAt <= now) {
          return;
        }

        payloads.push({
          title: `${reminder.label} 식단 기록 알림`,
          body: "식단을 기록할 시간이에요.",
          scheduledAt: formatLocalDateTime(scheduledAt),
          targetUrl: mealTargetUrl,
        });
      });
  }

  return payloads;
}

function buildWorkoutSchedulePayloads(reminders: WorkoutReminderTime[]) {
  const now = new Date();
  const payloads: NotificationSchedulePayload[] = [];

  for (let dayOffset = 0; dayOffset < scheduleLookaheadDays; dayOffset += 1) {
    const baseDate = addDays(now, dayOffset);

    reminders
      .filter((reminder) => reminder.enabled && reminder.activeDays.length > 0)
      .forEach((reminder) => {
        const workoutAt = dateAtTime(baseDate, reminder.time);
        const workoutWeekday = jsWeekdayLabels[workoutAt.getDay()];

        if (!reminder.activeDays.includes(workoutWeekday)) {
          return;
        }

        const leadMinutes = Number(reminder.leadMinutes);
        const scheduledAt = new Date(workoutAt.getTime() - leadMinutes * 60_000);

        if (scheduledAt <= now) {
          return;
        }

        payloads.push({
          title: `${reminder.label} 운동 알림`,
          body: `${formatLeadMinutes(reminder.leadMinutes)} 뒤 운동 시작 시간이에요.`,
          scheduledAt: formatLocalDateTime(scheduledAt),
          targetUrl: workoutTargetUrl,
        });
      });
  }

  return payloads;
}

export function SettingsScreen({ settings }: SettingsScreenProps) {
  const router = useRouter();
  const {
    disablePushNotification,
    enablePushNotification,
    isProcessing: isPushProcessing,
    message: pushMessage,
    permissionStatus,
  } = usePushNotification();
  const [notificationMap, setNotificationMap] = useState(
    Object.fromEntries(
      settings.notifications.map((item) => [item.key, item.enabled]),
    ),
  );
  const [mealReminderTimes, setMealReminderTimes] = useState(
    initialMealReminderTimes,
  );
  const [workoutReminderTimes, setWorkoutReminderTimes] = useState(
    initialWorkoutReminderTimes,
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [saveMessageTone, setSaveMessageTone] = useState<"success" | "error">(
    "success",
  );
  const [isSavingNotificationSchedules, setIsSavingNotificationSchedules] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pushAgreed = Boolean(notificationMap.push);
  const pushToggleDisabled =
    isPushProcessing ||
    isSavingNotificationSchedules ||
    permissionStatus === "unsupported";
  const mealNotification = settings.notifications.find(
    (item) => item.key === "meal",
  );
  const workoutNotification = settings.notifications.find(
    (item) => item.key === "workout",
  );

  useEffect(() => {
    let mounted = true;
    const restoreStoredPreferencesId = window.setTimeout(() => {
      const storedPreferences = readReminderPreferences();

      if (!mounted) {
        return;
      }

      if (storedPreferences?.notificationMap) {
        setNotificationMap((previous) => ({
          ...previous,
          ...storedPreferences.notificationMap,
        }));
      }

      if (storedPreferences?.mealReminderTimes?.length) {
        setMealReminderTimes(storedPreferences.mealReminderTimes);
      }

      if (storedPreferences?.workoutReminderTimes?.length) {
        setWorkoutReminderTimes(storedPreferences.workoutReminderTimes);
      }

      void restorePendingSchedules();
    }, 0);

    async function restorePendingSchedules() {
      try {
        const pendingSchedules = await getNotificationSchedules("PENDING");

        if (!mounted) {
          return;
        }

        const mealSchedules = getSchedulesByTargetUrl(
          pendingSchedules,
          mealTargetUrl,
        );
        const workoutSchedules = getWorkoutSchedules(pendingSchedules);

        setNotificationMap((previous) => ({
          ...previous,
          meal: mealSchedules.length > 0,
          workout: workoutSchedules.length > 0,
        }));

        if (mealSchedules.length > 0) {
          setMealReminderTimes(restoreMealReminderTimes(mealSchedules));
        }

        if (workoutSchedules.length > 0) {
          setWorkoutReminderTimes(restoreWorkoutReminderTimes(workoutSchedules));
        }
      } catch (error) {
        console.error(error);
      }
    }

    return () => {
      mounted = false;
      window.clearTimeout(restoreStoredPreferencesId);
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // Local session cleanup still lets the user return to the login screen.
    } finally {
      clearAuthSession();
      router.replace("/splash-screen?login=1");
      router.refresh();
    }
  }

  async function togglePushNotification() {
    if (isPushProcessing) {
      return;
    }

    setSavedMessage(null);

    if (!pushAgreed) {
      const enabled = await enablePushNotification();

      if (!enabled) {
        return;
      }

      setNotificationMap((previous) => ({
        ...previous,
        push: true,
      }));
      writeReminderPreferences({
        notificationMap: {
          ...notificationMap,
          push: true,
        },
        mealReminderTimes,
        workoutReminderTimes,
      });
      return;
    }

    const disabled = await disablePushNotification();

    if (!disabled) {
      return;
    }

    setNotificationMap((previous) => ({
      ...previous,
      push: false,
      meal: false,
      workout: false,
    }));
    writeReminderPreferences({
      notificationMap: {
        ...notificationMap,
        push: false,
        meal: false,
        workout: false,
      },
      mealReminderTimes,
      workoutReminderTimes,
    });
  }

  function toggleNotification(key: string) {
    if (key === "push") {
      void togglePushNotification();
      return;
    }

    setNotificationMap((previous) => {
      const nextValue = !previous[key];

      return {
        ...previous,
        [key]: nextValue,
      };
    });
    setSavedMessage(null);
  }

  function toggleWorkoutActiveDay(reminderId: string, day: string) {
    setWorkoutReminderTimes((previous) =>
      previous.map((item) => {
        if (item.id !== reminderId) {
          return item;
        }

        return {
          ...item,
          activeDays: item.activeDays.includes(day)
            ? item.activeDays.filter((activeDay) => activeDay !== day)
            : [...item.activeDays, day],
        };
      }),
    );
    setSavedMessage(null);
  }

  function updateMealReminderTime(
    id: string,
    patch: Partial<Pick<ReminderTime, "time" | "enabled">>,
  ) {
    setMealReminderTimes((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setSavedMessage(null);
  }

  function addMealReminderTime() {
    setMealReminderTimes((previous) => {
      const lastReminder = previous[previous.length - 1];

      return [
        ...previous,
        {
          id: `meal-custom-${Date.now()}`,
          label: `식단 ${previous.length + 1}`,
          time: addMinutesToTime(lastReminder?.time ?? "08:00", 120),
          enabled: true,
          removable: true,
        },
      ];
    });
    setSavedMessage(null);
  }

  function removeMealReminderTime(id: string) {
    setMealReminderTimes((previous) =>
      previous.filter((item) => item.id !== id),
    );
    setSavedMessage(null);
  }

  function updateWorkoutReminderTime(
    id: string,
    patch: Partial<Pick<WorkoutReminderTime, "time" | "enabled" | "leadMinutes">>,
  ) {
    setWorkoutReminderTimes((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setSavedMessage(null);
  }

  function addWorkoutReminderTime() {
    setWorkoutReminderTimes((previous) => {
      const lastReminder = previous[previous.length - 1];

      return [
        ...previous,
        {
          id: `workout-custom-${Date.now()}`,
          label: `운동 ${previous.length + 1}`,
          time: addMinutesToTime(lastReminder?.time ?? "18:30", 120),
          enabled: true,
          leadMinutes: lastReminder?.leadMinutes ?? "30",
          activeDays: [...(lastReminder?.activeDays ?? weekdayLabels)],
          removable: true,
        },
      ];
    });
    setSavedMessage(null);
  }

  function removeWorkoutReminderTime(id: string) {
    setWorkoutReminderTimes((previous) =>
      previous.length > 1 ? previous.filter((item) => item.id !== id) : previous,
    );
    setSavedMessage(null);
  }

  async function handleSave() {
    if (isSavingNotificationSchedules) {
      return;
    }

    setSavedMessage(null);
    setSaveMessageTone("success");
    setIsSavingNotificationSchedules(true);

    try {
      const pendingSchedules = await getNotificationSchedules("PENDING");
      const managedSchedules = pendingSchedules.filter((schedule) =>
        managedReminderTargetUrls.has(schedule.targetUrl),
      );
      const nextSchedules = [
        ...(notificationMap.meal
          ? buildMealSchedulePayloads(mealReminderTimes)
          : []),
        ...(notificationMap.workout
          ? buildWorkoutSchedulePayloads(workoutReminderTimes)
          : []),
      ];

      await Promise.all(
        managedSchedules.map((schedule) =>
          cancelNotificationSchedule(schedule.id),
        ),
      );
      await Promise.all(
        nextSchedules.map((schedule) => createNotificationSchedule(schedule)),
      );
      writeReminderPreferences({
        notificationMap,
        mealReminderTimes,
        workoutReminderTimes,
      });

      setSaveMessageTone("success");
      setSavedMessage(
        nextSchedules.length > 0
          ? `앞으로 ${scheduleLookaheadDays}일치 알림 예약이 저장되었습니다.`
          : "알림 예약이 해제되었습니다.",
      );
    } catch (error) {
      console.error(error);
      setSaveMessageTone("error");
      setSavedMessage("알림 예약 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSavingNotificationSchedules(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="설정" fallbackHref="/mypage" />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 py-6 pb-10">
        <section className="space-y-2">
          <SectionTitle>계정 정보</SectionTitle>
          <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
            {settings.accountActions.map((action) => {
              const content = (
                <div className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50">
                  <div
                    className={`flex items-center gap-3 ${
                      action.tone === "danger" ? "text-rose-500" : "text-slate-700"
                    }`}
                  >
                    <LogOutIcon className="size-5" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ChevronRightIcon className="size-4 text-slate-300" />
                </div>
              );

              if (action.href) {
                return (
                  <Link key={action.label} href={action.href}>
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={action.label}
                  type="button"
                  className="w-full text-left disabled:cursor-wait disabled:opacity-70"
                  disabled={isLoggingOut}
                  onClick={action.action === "logout" ? handleLogout : undefined}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionTitle>알림 발송 여부</SectionTitle>
          <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <BellIcon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    푸시 알림 발송 동의
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    운동과 식단 리마인더를 브라우저 알림으로 받을 수 있어요.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={pushAgreed}
                onToggle={() => toggleNotification("push")}
                disabled={pushToggleDisabled}
                label="푸시 알림 발송 동의"
              />
            </div>
            <p
              className={`mt-4 rounded-2xl px-4 py-3 text-[11px] font-bold leading-5 ${
                permissionStatus === "error" || permissionStatus === "denied"
                  ? "bg-rose-50 text-rose-500"
                  : permissionStatus === "subscribed"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-50 text-slate-500"
              }`}
              role="status"
            >
              {pushMessage}
            </p>
          </div>

        </section>

        {pushAgreed ? (
          <>
            <section className="space-y-3">
              <SectionTitle>리마인더 설정</SectionTitle>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <UtensilsIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {mealNotification?.title ?? "식단 기록 리마인더"}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        {mealNotification?.description ??
                          "식사별 기록 시간을 따로 설정할 수 있어요."}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={Boolean(notificationMap.meal)}
                    onToggle={() => toggleNotification("meal")}
                    label={`${mealNotification?.title ?? "식단 기록 리마인더"} 사용`}
                  />
                </div>

                {notificationMap.meal ? (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    {mealReminderTimes.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <span className="min-w-[58px] text-sm font-bold text-slate-700">
                          {reminder.label}
                        </span>
                        <input
                          type="time"
                          value={reminder.time}
                          disabled={!reminder.enabled}
                          onChange={(event) => {
                            updateMealReminderTime(reminder.id, {
                              time: event.target.value,
                            });
                          }}
                          className="min-w-0 flex-1 bg-transparent text-right text-sm font-black text-slate-800 outline-none disabled:text-slate-400"
                        />
                        <ToggleSwitch
                          checked={reminder.enabled}
                          onToggle={() => {
                            updateMealReminderTime(reminder.id, {
                              enabled: !reminder.enabled,
                            });
                          }}
                          tone="amber"
                          label={`${reminder.label} 식단 알림`}
                        />
                        {reminder.removable ? (
                          <button
                            type="button"
                            onClick={() => removeMealReminderTime(reminder.id)}
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 transition hover:text-rose-500"
                            aria-label={`${reminder.label} 식단 알림 삭제`}
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addMealReminderTime}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <PlusIcon className="size-4" />
                      식단 알림 시간 추가
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <DumbbellIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {workoutNotification?.title ?? "운동 기록 리마인더"}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        {workoutNotification?.description ??
                          "루틴 시작 전 원하는 시간에 알려드려요."}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={Boolean(notificationMap.workout)}
                    onToggle={() => toggleNotification("workout")}
                    label={`${workoutNotification?.title ?? "운동 기록 리마인더"} 사용`}
                  />
                </div>

                {notificationMap.workout ? (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    {workoutReminderTimes.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-black text-slate-800">
                            {reminder.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={reminder.enabled}
                              onToggle={() => {
                                updateWorkoutReminderTime(reminder.id, {
                                  enabled: !reminder.enabled,
                                });
                              }}
                              label={`${reminder.label} 운동 알림`}
                            />
                            {workoutReminderTimes.length > 1 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  removeWorkoutReminderTime(reminder.id)
                                }
                                className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 transition hover:text-rose-500"
                                aria-label={`${reminder.label} 운동 알림 삭제`}
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                            <span className="text-sm font-bold text-slate-700">
                              운동 시작 시간
                            </span>
                            <input
                              type="time"
                              value={reminder.time}
                              disabled={!reminder.enabled}
                              onChange={(event) => {
                                updateWorkoutReminderTime(reminder.id, {
                                  time: event.target.value,
                                });
                              }}
                              className="bg-transparent text-right text-sm font-black text-slate-800 outline-none disabled:text-slate-400"
                            />
                          </label>

                          <label className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                            <span className="text-sm font-bold text-slate-700">
                              운동 전 알림
                            </span>
                            <select
                              value={reminder.leadMinutes}
                              disabled={!reminder.enabled}
                              onChange={(event) => {
                                updateWorkoutReminderTime(reminder.id, {
                                  leadMinutes: event.target.value,
                                });
                              }}
                              className="bg-transparent text-right text-sm font-black text-slate-800 outline-none disabled:text-slate-400"
                            >
                              <option value="10">10분 전</option>
                              <option value="30">30분 전</option>
                              <option value="60">1시간 전</option>
                            </select>
                          </label>

                          <div className="rounded-2xl bg-white px-4 py-3">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-700">
                                반복 요일
                              </span>
                              <ClockIcon className="size-4 text-slate-300" />
                            </div>
                            <div className="grid grid-cols-7 gap-1.5">
                              {weekdayLabels.map((day) => {
                                const active = reminder.activeDays.includes(day);

                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    disabled={!reminder.enabled}
                                    onClick={() =>
                                      toggleWorkoutActiveDay(reminder.id, day)
                                    }
                                    className={`aspect-square rounded-full text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                      active
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-50 text-slate-300"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addWorkoutReminderTime}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 py-3 text-sm font-black text-indigo-700 transition hover:bg-indigo-50"
                    >
                      <PlusIcon className="size-4" />
                      운동 알림 시간 추가
                    </button>

                  </div>
                ) : null}
              </div>
            </section>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-100 p-4">
                <InfoIcon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <p className="text-[11px] leading-5 text-slate-500">
                  브라우저 권한이 꺼져 있으면 앱 설정과 별개로 알림이 표시되지 않을 수 있어요.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingNotificationSchedules}
                className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-100 disabled:cursor-wait disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSavingNotificationSchedules ? "저장 중..." : "저장하기"}
              </button>
              {savedMessage ? (
                <p
                  className={`text-center text-xs font-bold ${
                    saveMessageTone === "error"
                      ? "text-rose-500"
                      : "text-emerald-500"
                  }`}
                >
                  {savedMessage}
                </p>
              ) : null}
            </div>
          </>
        ) : null}

        <section className="space-y-2">
          <SectionTitle>지원 및 정보</SectionTitle>
          <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
            {settings.infoItems.map((item, index) => {
              const Icon =
                item.icon === "faq"
                  ? HelpCircleIcon
                  : item.icon === "shield"
                    ? ShieldIcon
                    : InfoIcon;

              const row = (
                <div className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  {item.value ? (
                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                      {item.value}
                    </span>
                  ) : (
                    <ChevronRightIcon className="size-4 text-slate-300" />
                  )}
                </div>
              );

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={index < settings.infoItems.length - 1 ? "block border-b border-slate-50" : "block"}
                >
                  {row}
                </Link>
              ) : (
                <div
                  key={item.label}
                  className={index < settings.infoItems.length - 1 ? "border-b border-slate-50" : ""}
                >
                  {row}
                </div>
              );
            })}
          </div>
        </section>

        <p className="pt-4 text-center text-[10px] font-medium tracking-tight text-slate-300">
          © 2026 FitLog. All rights reserved.
        </p>
      </main>
    </div>
  );
}
