"use client";

import Link from "next/link";
import {
  BellIcon,
  ChevronRightIcon,
  DumbbellIcon,
  HelpCircleIcon,
  InfoIcon,
  LogOutIcon,
  ShieldIcon,
  UtensilsIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { SettingsData } from "../types";
import { useState } from "react";

type SettingsScreenProps = {
  settings: SettingsData;
};

export function SettingsScreen({ settings }: SettingsScreenProps) {
  const [notificationMap, setNotificationMap] = useState(
    Object.fromEntries(
      settings.notifications.map((item) => [item.key, item.enabled]),
    ),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <StackHeader title="설정" fallbackHref="/mypage" />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-5 py-6 pb-10">
        <section className="space-y-2">
          <h2 className="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
            계정 정보
          </h2>
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

              return <button key={action.label} type="button" className="w-full text-left">{content}</button>;
            })}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
            서비스 알림
          </h2>
          <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
            {settings.notifications.map((item, index) => {
              const Icon =
                item.icon === "meal"
                  ? UtensilsIcon
                  : item.icon === "workout"
                    ? DumbbellIcon
                    : BellIcon;

              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    index < settings.notifications.length - 1
                      ? "border-b border-slate-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {item.title}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-[11px] leading-5 text-slate-400">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={Boolean(notificationMap[item.key])}
                    onToggle={() =>
                      setNotificationMap((previous) => ({
                        ...previous,
                        [item.key]: !previous[item.key],
                      }))
                    }
                    label={`${item.title} 토글`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="ml-1 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
            지원 및 정보
          </h2>
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
                  className={index < settings.infoItems.length - 1 ? "border-b border-slate-50" : ""}
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
