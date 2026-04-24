"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CameraIcon,
  ChevronRightIcon,
  PencilIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons";
import { BottomNav } from "@/components/navigation/bottom-nav";
import type { ProfileScreenData } from "../types";

type ProfileScreenProps = {
  profile: ProfileScreenData;
};

function buildPath(points: number[]) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * 100;
      const y = 90 - ((point - min) / range) * 60;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function ProfileScreen({ profile }: ProfileScreenProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [draftName, setDraftName] = useState(profile.displayName);
  const [editing, setEditing] = useState(false);
  const [currentMetricKey, setCurrentMetricKey] = useState(profile.metrics[0]?.key);

  const currentMetric = useMemo(
    () =>
      profile.metrics.find((metric) => metric.key === currentMetricKey) ??
      profile.metrics[0],
    [currentMetricKey, profile.metrics],
  );

  if (!currentMetric) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="relative bg-[linear-gradient(135deg,#4338ca_0%,#7c3aed_100%)] px-5 pt-6 pb-10 text-white">
        <div className="absolute -top-12 -left-10 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 size-48 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-md">
          <div className="mb-5 flex justify-end">
            <Link
              href="/setting"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/20"
              aria-label="설정"
            >
              <SettingsIcon className="size-[18px]" />
            </Link>
          </div>

          <div className="flex items-start gap-4 pr-2">
            <div className="relative">
              <div className="flex size-16 items-center justify-center rounded-[24px] border-2 border-white/40 bg-white/20">
                <UserIcon className="size-8" />
              </div>
              <button
                type="button"
                className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-white text-indigo-600 shadow-lg"
                aria-label="프로필 사진"
              >
                <CameraIcon className="size-3.5" />
              </button>
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black">{displayName}님</h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(displayName);
                    setEditing(true);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="프로필 수정"
                >
                  <PencilIcon className="size-4" />
                </button>
              </div>
              <p className="mt-1 mb-4 text-xs font-medium text-white/70">
                운동 시작한 지 <span className="font-bold text-white">{profile.startedDaysAgo}일</span>째
              </p>
            </div>
          </div>

          <section className="absolute inset-x-4 -bottom-20 grid grid-cols-3 rounded-[28px] border border-slate-50 bg-white px-4 py-4 text-slate-900 shadow-xl shadow-indigo-950/10">
            {profile.summaryStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${index < profile.summaryStats.length - 1 ? "border-r border-slate-100" : ""}`}
              >
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">{stat.value}</p>
              </div>
            ))}
          </section>
        </div>
      </header>

      <main className="mx-auto mt-16 flex max-w-md flex-col gap-6 px-5">
        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">목표 달성 현황</h2>
            <span className="text-[11px] font-bold text-indigo-600">
              {profile.goal.label}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${profile.goal.percent}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            {profile.goal.helper}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              신체 지표 변화
            </h2>
            <span className="text-[10px] font-medium text-slate-300">
              최근 5회 기록
            </span>
          </div>

          <div className="space-y-6 rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-black"
                  style={{
                    color: currentMetric.color,
                    backgroundColor: `${currentMetric.color}12`,
                  }}
                >
                  {currentMetric.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  현재 {currentMetric.value}
                  {currentMetric.unit}
                </span>
              </div>

              <div className="relative h-36">
                <div className="absolute inset-0 flex flex-col justify-between opacity-50">
                  <div className="border-t border-slate-100" />
                  <div className="border-t border-slate-100" />
                  <div className="border-t border-slate-100" />
                </div>

                <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible">
                  <path
                    d={buildPath(currentMetric.series)}
                    fill="none"
                    stroke={currentMetric.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {currentMetric.series.map((point, index) => {
                    const max = Math.max(...currentMetric.series);
                    const min = Math.min(...currentMetric.series);
                    const range = max - min || 1;
                    const x = (index / (currentMetric.series.length - 1 || 1)) * 100;
                    const y = 90 - ((point - min) / range) * 60;
                    const active = index === currentMetric.series.length - 1;

                    return (
                      <circle
                        key={`${currentMetric.key}-${index}`}
                        cx={x}
                        cy={y}
                        r={active ? 4.5 : 3.5}
                        fill={active ? currentMetric.color : "white"}
                        stroke={currentMetric.color}
                        strokeWidth="1.8"
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-5 text-center text-[9px] font-bold text-slate-300">
                <span>03.20</span>
                <span>03.25</span>
                <span>04.01</span>
                <span>04.05</span>
                <span style={{ color: currentMetric.color }}>오늘</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {profile.metrics.map((metric) => {
                const active = metric.key === currentMetric.key;
                const deltaTone =
                  metric.deltaDirection === "up"
                    ? "text-emerald-500"
                    : "text-rose-500";

                return (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => setCurrentMetricKey(metric.key)}
                    className={`rounded-2xl border p-3 text-center transition ${
                      active
                        ? "border-transparent text-white shadow-xl"
                        : "border-slate-100 bg-white"
                    }`}
                    style={active ? { backgroundColor: metric.color } : undefined}
                  >
                    <p
                      className={`text-[9px] font-bold ${
                        active ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {metric.label}
                    </p>
                    <p
                      className={`mt-1 text-sm font-black ${
                        active ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {metric.value}
                      <span className="ml-1 text-[8px] font-normal">
                        {metric.unit}
                      </span>
                    </p>
                    <p
                      className={`mt-1 text-[10px] font-bold ${
                        active ? "text-white" : deltaTone
                      }`}
                    >
                      {metric.delta}
                    </p>
                  </button>
                );
              })}
            </div>

            <Link
              href="/body-info"
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800"
            >
              <span className="text-white">+</span>
              <span className="text-white">
              새 신체 데이터 기록
              </span>
            </Link>
          </div>
        </section>

        <section className="hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-50 bg-slate-50/60 px-5 py-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              빠른 이동
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {profile.shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">{shortcut.label}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {shortcut.description}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-black text-slate-800">프로필 수정</h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"
              >
                닫기
              </button>
            </div>
            <form
              className="space-y-5 p-6"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draftName.trim()) {
                  return;
                }

                setDisplayName(draftName.trim());
                setEditing(false);
              }}
            >
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  닉네임
                </label>
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <BottomNav current="mypage" />
    </div>
  );
}
