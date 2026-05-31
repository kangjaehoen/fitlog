"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import {
  CameraIcon,
  ChartIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserIcon,
} from "@/components/icons";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { buildApiAssetUrl } from "@/lib/api-client";
import { getPersistedAuthToken, updatePersistedNickname } from "../auth-session";
import { updateProfileImage, updateProfileNickname } from "../api";
import type { ProfileScreenData } from "../types";

type ProfileScreenProps = {
  profile: ProfileScreenData;
};

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

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

function ProfileLogoMark() {
  return (
    <div className="pointer-events-none absolute right-0 top-10 size-[116px] opacity-75">
      <div className="absolute inset-0 rounded-[28px] bg-white/8" />
      <div className="absolute inset-3 rotate-[-10deg] rounded-[22px] bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="absolute right-4 top-4 size-[78px] rotate-[-10deg]"
      >
        <defs>
          <linearGradient id="profile-logo-card" x1="21" y1="17" x2="77" y2="82">
            <stop stopColor="#baadff" />
            <stop offset="1" stopColor="#7564ef" />
          </linearGradient>
          <linearGradient id="profile-logo-avatar" x1="34" y1="25" x2="60" y2="61">
            <stop stopColor="#efeaff" />
            <stop offset="1" stopColor="#cfc6ff" />
          </linearGradient>
        </defs>
        <rect
          x="23"
          y="18"
          width="51"
          height="60"
          rx="15"
          fill="url(#profile-logo-card)"
          opacity="0.95"
        />
        <circle cx="48.5" cy="35.5" r="10.5" fill="url(#profile-logo-avatar)" />
        <path
          d="M33.5 59.5c2.4-8.1 8.1-12.2 15-12.2s12.6 4.1 15 12.2"
          fill="#d8d1ff"
          opacity="0.92"
        />
        <rect x="34" y="64" width="19" height="4.5" rx="2.25" fill="#5f4be2" opacity="0.56" />
        <rect x="57" y="64" width="8" height="4.5" rx="2.25" fill="#5f4be2" opacity="0.32" />
        <circle cx="66" cy="27" r="3.2" fill="#ded8ff" opacity="0.86" />
        <circle cx="70.5" cy="35.5" r="2.4" fill="#ded8ff" opacity="0.58" />
        <path
          d="M35 73h27"
          stroke="#ded8ff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.68"
        />
      </svg>
    </div>
  );
}

export function ProfileScreen({ profile }: ProfileScreenProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [profileImageUrl, setProfileImageUrl] = useState(
    profile.profileImageUrl ?? null,
  );
  const [draftName, setDraftName] = useState(profile.displayName);
  const [editing, setEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
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

  const dateLabels =
    currentMetric.dateLabels?.length ? currentMetric.dateLabels : ["오늘"];
  const resolvedProfileImageUrl = buildApiAssetUrl(profileImageUrl);

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const image = event.target.files?.[0];
    event.target.value = "";

    if (!image) {
      return;
    }
    if (!image.type.startsWith("image/")) {
      setImageError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (image.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("프로필 이미지는 5MB 이하로 업로드해 주세요.");
      return;
    }

    setUploadingImage(true);
    setImageError(null);

    try {
      const response = await updateProfileImage(image, getPersistedAuthToken());
      setProfileImageUrl(response.profileImageUrl);
      router.refresh();
    } catch (error) {
      setImageError(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해 주세요."
          : "프로필 이미지 업로드 중 문제가 발생했습니다.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNicknameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nickname = draftName.trim();
    if (!nickname) {
      setEditError("닉네임을 입력해주세요.");
      return;
    }

    setSavingName(true);
    setEditError(null);

    try {
      const updatedProfile = await updateProfileNickname(
        nickname,
        getPersistedAuthToken(),
      );
      setDisplayName(updatedProfile.displayName);
      setDraftName(updatedProfile.displayName);
      updatePersistedNickname(updatedProfile.displayName);
      setEditing(false);
      router.refresh();
    } catch (error) {
      setEditError(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해주세요."
          : "닉네임 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-32">
      <header
        className="relative px-5 pb-10 pt-6 text-white shadow-[0_14px_28px_rgba(96,72,220,0.22)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 82% 34%, rgba(255,255,255,0.20), transparent 30%), linear-gradient(135deg, #8374f6 0%, #6651e8 48%, #5941d9 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
        <div className="relative mx-auto max-w-md">
          <ProfileLogoMark />
          <div className="mb-5 flex justify-end">
            <Link
              href="/setting"
              className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/20"
              aria-label="설정"
            >
              <SettingsIcon className="size-[18px]" />
            </Link>
          </div>

          <div className="relative flex items-start gap-4 pr-20">
            <div className="relative">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-[24px] border-2 border-white/40 bg-white/20">
                {resolvedProfileImageUrl ? (
                  <img
                    src={resolvedProfileImageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <UserIcon className="size-8" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => void handleProfileImageChange(event)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
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
                    setEditError(null);
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
              {imageError ? (
                <p className="mb-3 text-xs font-semibold text-rose-100">
                  {imageError}
                </p>
              ) : null}
            </div>
          </div>

          <section className="absolute inset-x-4 -bottom-20 grid grid-cols-3 rounded-[14px] border border-[#edf0ff] bg-white px-4 py-4 text-[#22243d] shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
            {profile.summaryStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center ${index < profile.summaryStats.length - 1 ? "border-r border-[#eef0f8]" : ""}`}
              >
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-black text-[#22243d]">{stat.value}</p>
              </div>
            ))}
          </section>
        </div>
      </header>

      <main className="mx-auto mt-16 flex w-full max-w-[390px] flex-col gap-3 px-4 pb-4">
        <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-1.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
                <SparklesIcon className="size-3.5" />
              </span>
              <h2 className="min-w-0 truncate text-[13px] font-black leading-none text-[#22243d]">
                목표 달성 현황
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
              {profile.goal.label}
            </span>
          </div>

          <div className="rounded-[10px] border border-[#eef0f8] bg-[#faf9ff] px-3 py-3 shadow-[0_8px_20px_rgba(45,50,92,0.04)]">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[12px] font-bold text-slate-500">현재 진행률</p>
              <p className="text-[19px] font-black leading-none text-[#6653e9]">
                {profile.goal.percent}%
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ebe9f8]">
              <div
                className="h-full rounded-full bg-[linear-gradient(135deg,#e879c6_0%,#8b5cf6_52%,#6653e9_100%)] shadow-[0_8px_18px_rgba(102,83,233,0.24)]"
                style={{ width: `${Math.min(100, Math.max(0, profile.goal.percent))}%` }}
              />
            </div>
            <p className="mt-3 text-[12px] font-medium leading-relaxed text-[#22243d]">
              {profile.goal.helper}
            </p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { label: "레벨", value: profile.levelLabel },
              { label: "연속 기록", value: profile.streakLabel },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[10px] border border-[#eef0f8] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(45,50,92,0.04)]"
              >
                <p className="text-[10px] font-bold text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-[13px] font-black text-[#22243d]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div className="inline-flex min-w-0 flex-1 items-center gap-1.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
                <ChartIcon className="size-3.5" />
              </span>
              <h2 className="min-w-0 truncate text-[13px] font-black leading-none text-[#22243d]">
                신체 지표 변화
              </h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
              <TrendingUpIcon className="size-3.5" />
              최근 5회
            </span>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black leading-none"
                style={{
                  color: currentMetric.color,
                  backgroundColor: `${currentMetric.color}14`,
                }}
              >
                {currentMetric.label}
              </span>
              <span className="text-[12px] font-bold text-slate-500">
                현재{" "}
                <span className="font-black text-[#22243d]">
                  {currentMetric.value}
                  {currentMetric.unit}
                </span>
              </span>
            </div>

            <div className="relative h-[152px] rounded-[10px] border border-[#eef0f8] bg-[#faf9ff] px-3 py-4 shadow-[0_8px_20px_rgba(45,50,92,0.04)]">
              <div className="absolute inset-x-3 top-6 bottom-9 flex flex-col justify-between">
                <div className="border-t border-dashed border-violet-100" />
                <div className="border-t border-dashed border-violet-100" />
                <div className="border-t border-dashed border-violet-100" />
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

            <div
              className="mt-2 grid text-center text-[9px] font-bold text-slate-300"
              style={{
                gridTemplateColumns: `repeat(${dateLabels.length}, minmax(0, 1fr))`,
              }}
            >
              {dateLabels.map((label, index) => (
                <span
                  key={`${currentMetric.key}-${label}-${index}`}
                  style={
                    index === dateLabels.length - 1
                      ? { color: currentMetric.color }
                      : undefined
                  }
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
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
                  className={`min-h-[83px] rounded-[10px] border px-2 py-2.5 text-center shadow-[0_8px_20px_rgba(45,50,92,0.04)] transition ${
                    active
                      ? "border-transparent text-white shadow-[0_10px_22px_rgba(102,83,233,0.20)]"
                      : "border-[#eef0f8] bg-white"
                  }`}
                  style={active ? { backgroundColor: metric.color } : undefined}
                >
                  <p
                    className={`text-[10px] font-bold ${
                      active ? "text-white/85" : "text-slate-400"
                    }`}
                  >
                    {metric.label}
                  </p>
                  <p
                    className={`mt-2 text-[15px] font-black leading-none ${
                      active ? "text-white" : "text-[#22243d]"
                    }`}
                  >
                    {metric.value}
                    <span className="ml-1 text-[8px] font-bold">
                      {metric.unit}
                    </span>
                  </p>
                  <p
                    className={`mt-2 text-[10px] font-black ${
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
            className="mt-3 flex h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#8876fb,#6150dc)] px-4 text-[13px] font-black text-white shadow-[0_12px_22px_rgba(97,80,220,0.24)] transition hover:-translate-y-0.5"
          >
            <PlusIcon className="size-4" />
            <span>새 신체 데이터 기록</span>
          </Link>
        </section>

        <section className="hidden rounded-[14px] border border-[#edf0ff] bg-white shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
          <div className="border-b border-[#eef0f8] bg-[#faf9ff] px-5 py-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              빠른 이동
            </h2>
          </div>
          <div className="divide-y divide-[#eef0f8]">
            {profile.shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="flex items-center justify-between px-5 py-4 transition hover:bg-[#f8f8ff]"
              >
                <div>
                  <p className="text-sm font-bold text-[#22243d]">{shortcut.label}</p>
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
                onClick={() => {
                  setEditError(null);
                  setEditing(false);
                }}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500"
              >
                닫기
              </button>
            </div>
            <form
              className="space-y-5 p-6"
              onSubmit={(event) => void handleNicknameSubmit(event)}
            >
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  닉네임
                </label>
                <input
                  value={draftName}
                  onChange={(event) => {
                    setDraftName(event.target.value);
                    setEditError(null);
                  }}
                  maxLength={40}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              {editError ? (
                <p className="text-xs font-semibold text-rose-500">
                  {editError}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditError(null);
                    setEditing(false);
                  }}
                  disabled={savingName}
                  className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={savingName}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200"
                >
                  {savingName ? "저장 중" : "저장"}
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
