"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  GripVerticalIcon,
  PencilIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/icons";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import { deleteRoutine, reorderRoutines } from "../api";
import type { RoutineOverview } from "../types";

type RoutineScreenProps = {
  overview: RoutineOverview;
  presentation?: "tab" | "stack";
};

const toneStyles = {
  indigo: {
    badge: "bg-[#f1efff] text-[#6653e9]",
    icon: "text-[#6653e9]",
    iconBg: "bg-[#f1efff]",
    accent: "from-[#8b5cf6] to-[#4f46e5]",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-600",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-50",
    accent: "from-emerald-400 to-emerald-600",
  },
  orange: {
    badge: "bg-orange-50 text-orange-600",
    icon: "text-orange-600",
    iconBg: "bg-orange-50",
    accent: "from-orange-300 to-orange-500",
  },
} as const;

const buttonStyles = {
  dark: "bg-[linear-gradient(135deg,#8876fb,#6150dc)] text-white shadow-[0_12px_22px_rgba(97,80,220,0.24)]",
  muted: "border border-[#e7e4ff] bg-[#f7f5ff] text-[#5b50f4]",
  disabled: "bg-slate-100 text-slate-400",
} as const;

export function RoutineScreen({
  overview,
  presentation = "tab",
}: RoutineScreenProps) {
  const router = useRouter();
  const [routines, setRoutines] = useState(overview.routines);
  const [searchTerm, setSearchTerm] = useState("");
  const [manageMode, setManageMode] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showBottomNav = presentation === "tab";
  const bottomPaddingClass = showBottomNav
    ? manageMode
      ? "pb-28"
      : "pb-[196px]"
    : "pb-36";
  const createActionBottomClass = showBottomNav ? "bottom-[78px]" : "bottom-0";
  const activeRoutineCount = routines.filter((routine) => !routine.disabled).length;
  const totalExerciseCount = routines.reduce(
    (sum, routine) => sum + extractFirstNumber(routine.exerciseSummary),
    0,
  );

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const filteredRoutines = useMemo(() => {
    if (!normalizedSearchTerm) {
      return routines;
    }

    return routines.filter((routine) =>
      normalizeSearchText(
        [
          routine.title,
          routine.description,
          routine.exerciseSummary,
          routine.frequencyLabel,
        ].join(" "),
      ).includes(normalizedSearchTerm),
    );
  }, [normalizedSearchTerm, routines]);
  const sectionLabel = searchTerm.trim()
    ? `검색 결과 (${filteredRoutines.length})`
    : overview.sectionTitle || `내 루틴 (${routines.length})`;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleToggleManageMode = () => {
    setManageMode((previous) => !previous);
    setSearchTerm("");
    setErrorMessage(null);
  };

  const handleStartRoutine = (routineId: number) => {
    router.push(`/today-workout-log?routineId=${routineId}`);
  };

  const handleMoveRoutine = async (routineId: number, direction: -1 | 1) => {
    const currentIndex = routines.findIndex((routine) => routine.id === routineId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= routines.length) {
      return;
    }

    const previousRoutines = routines;
    const nextRoutines = [...routines];
    [nextRoutines[currentIndex], nextRoutines[nextIndex]] = [
      nextRoutines[nextIndex],
      nextRoutines[currentIndex],
    ];

    setRoutines(nextRoutines);
    setPendingAction(true);
    setErrorMessage(null);

    try {
      await reorderRoutines(
        nextRoutines.map((routine) => routine.id),
        getPersistedAuthToken(),
      );
    } catch (error) {
      setRoutines(previousRoutines);
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 수정해주세요."
          : "루틴 순서 변경 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setPendingAction(false);
    }
  };

  const handleDeleteRoutine = async (routine: RoutineOverview["routines"][number]) => {
    if (!window.confirm(`"${routine.title}" 루틴을 삭제할까요?`)) {
      return;
    }

    const previousRoutines = routines;
    const nextRoutines = routines.filter((item) => item.id !== routine.id);

    setRoutines(nextRoutines);
    setPendingAction(true);
    setErrorMessage(null);

    try {
      await deleteRoutine(routine.id, getPersistedAuthToken());
      if (nextRoutines.length === 0) {
        setManageMode(false);
      }
    } catch (error) {
      setRoutines(previousRoutines);
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 삭제해주세요."
          : "루틴 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setPendingAction(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8f8ff] ${bottomPaddingClass}`}>
      <header className="sticky top-0 z-30 bg-[#f8f8ff]/95 backdrop-blur-[20px]">
        <div className="relative mx-auto flex w-full max-w-[390px] items-center px-4 py-3">
          {showBottomNav ? (
            <div className="size-11" aria-hidden="true" />
          ) : (
            <button
              type="button"
              onClick={handleBack}
              aria-label="뒤로가기"
              className="inline-flex size-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
          )}
          <h1 className="pointer-events-none absolute inset-x-0 text-center text-base font-bold text-slate-900">
            운동 루틴
          </h1>
          <div className="ml-auto size-11" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-4 pt-2">
        <section className="relative overflow-hidden rounded-[14px] px-5 py-[18px] text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_25%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-4 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <DumbbellIcon className="size-12" />
          </div>

          <div className="relative">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              ROUTINE
            </p>
            <h2 className="mt-2 text-[22px] font-black leading-tight">
              오늘 운동을 빠르게 시작해요
            </h2>
            <p className="mt-2 max-w-[240px] text-[12px] font-semibold leading-5 text-white/80">
              자주 하는 운동을 루틴으로 묶고 기록 화면으로 바로 이어가세요.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <RoutineMetric label="전체 루틴" value={`${routines.length}개`} />
              <RoutineMetric label="시작 가능" value={`${activeRoutineCount}개`} />
              <RoutineMetric
                label="운동 구성"
                value={totalExerciseCount > 0 ? `${totalExerciseCount}개` : "-"}
              />
            </div>
          </div>
        </section>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6f79a9]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={overview.searchPlaceholder}
            aria-label="루틴 검색"
            className="h-[52px] w-full rounded-[16px] border border-[#edf0ff] bg-white py-0 pl-12 pr-4 text-[14px] font-semibold text-[#11172f] shadow-[0_8px_18px_rgba(37,45,100,0.06)] outline-none transition placeholder:text-[#9299b2] focus:border-[#d8d3ff] focus:ring-4 focus:ring-[#7563f1]/10"
          />
        </div>

        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[14px] font-black leading-none text-[#11172f]">
              {sectionLabel}
            </h2>
            <button
              type="button"
              onClick={handleToggleManageMode}
              disabled={routines.length === 0}
              className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#5b50f4] shadow-[0_8px_16px_rgba(79,70,229,0.08)] ring-1 ring-[#ece8ff] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {manageMode ? "완료" : overview.editLabel}
            </button>
          </div>
          {manageMode ? (
            <p className="rounded-[14px] bg-white px-4 py-3 text-[12px] font-bold text-[#7380ad] shadow-[0_8px_18px_rgba(37,45,100,0.05)]">
              루틴 순서를 바꾸거나 삭제할 수 있습니다.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-[14px] bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}

          {filteredRoutines.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-indigo-200 bg-white px-5 py-8 text-center shadow-[0_8px_18px_rgba(37,45,100,0.06)]">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f1efff] text-[#6653e9]">
                <SearchIcon className="size-5" />
              </div>
              <p className="mt-4 text-[14px] font-black text-slate-800">
                {searchTerm.trim()
                  ? "검색 결과가 없습니다."
                  : "아직 만든 루틴이 없습니다."}
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                {searchTerm.trim()
                  ? "다른 루틴 이름이나 운동 구성으로 다시 찾아보세요."
                  : "자주 하는 운동을 저장하면 기록이 훨씬 빨라집니다."}
              </p>
            </div>
          ) : null}

          {filteredRoutines.map((routine) => {
            const routineIndex = routines.findIndex((item) => item.id === routine.id);
            const tone = toneStyles[routine.tone];
            const buttonClass = buttonStyles[routine.buttonVariant];
            const MetaIcon = routine.icon === "bolt" ? BoltIcon : DumbbellIcon;

            return (
              <article
                key={routine.id}
                className={`relative overflow-hidden rounded-[16px] border border-[#edf0ff] bg-white p-4 shadow-[0_10px_28px_rgba(37,45,100,0.08)] transition duration-200 ${
                  routine.subdued ? "opacity-60" : ""
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${tone.accent}`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${tone.iconBg} ${tone.icon}`}
                    >
                      <MetaIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="min-w-0 truncate text-[17px] font-black leading-tight text-[#11172f]">
                          {routine.title}
                        </h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black leading-none ${tone.badge}`}
                        >
                          {routine.frequencyLabel}
                        </span>
                      </div>
                      {routine.description ? (
                        <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-5 text-[#7a83a7]">
                          {routine.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {!routine.disabled ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/routine-edit?routineId=${routine.id}`)}
                      aria-label={`${routine.title} 루틴 편집`}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#f1efff] px-2.5 text-[11px] font-black text-[#5b50f4] transition active:scale-[0.96]"
                    >
                      <PencilIcon className="size-3.5" />
                      <span>편집</span>
                    </button>
                  ) : null}
                </div>

                {routine.exerciseSummary && routine.duration ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[#faf9ff] px-3">
                      <DumbbellIcon className={`size-4 shrink-0 ${tone.icon}`} />
                      <span className="min-w-0 truncate text-[12px] font-black text-slate-700">
                        {routine.exerciseSummary}
                      </span>
                    </div>
                    <div className="flex min-h-[48px] items-center gap-2 rounded-[12px] bg-slate-50 px-3">
                      <ClockIcon className="size-4 shrink-0 text-slate-400" />
                      <span className="min-w-0 truncate text-[12px] font-bold text-slate-500">
                        {routine.duration}
                      </span>
                    </div>
                  </div>
                ) : null}

                {manageMode ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMoveRoutine(routine.id, -1)}
                      disabled={pendingAction || routineIndex <= 0}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-slate-100 text-xs font-black text-slate-600 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <GripVerticalIcon className="size-4" />
                      위로
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMoveRoutine(routine.id, 1)}
                      disabled={pendingAction || routineIndex === routines.length - 1}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-slate-100 text-xs font-black text-slate-600 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <GripVerticalIcon className="size-4" />
                      아래로
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteRoutine(routine)}
                      disabled={pendingAction}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-rose-50 text-xs font-black text-rose-600 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <TrashIcon className="size-4" />
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={routine.disabled}
                    onClick={() =>
                      !routine.disabled ? handleStartRoutine(routine.id) : undefined
                    }
                    className={`mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] text-[13px] font-black transition-transform ${
                      routine.disabled ? "" : "active:scale-[0.98]"
                    } ${buttonClass}`}
                  >
                    <span>{overview.startActionLabel}</span>
                    {!routine.disabled ? <ChevronRightIcon className="size-4" /> : null}
                  </button>
                )}
              </article>
            );
          })}
        </section>
      </main>

      {!manageMode ? (
        <div
          className={`pointer-events-none fixed inset-x-0 ${createActionBottomClass} z-20`}
        >
          <div className="mx-auto w-full max-w-[390px] bg-gradient-to-t from-[#f8f8ff] via-[#f8f8ff]/95 to-transparent px-4 pb-6 pt-10">
            <button
              type="button"
              onClick={() => router.push("/routine-edit?mode=create")}
              className="pointer-events-auto flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#7d6cff]/20 bg-[linear-gradient(135deg,#7b61ff_0%,#5145e8_100%)] text-[15px] font-black text-white shadow-[0_14px_22px_rgba(84,69,232,0.26)] transition-transform active:scale-[0.97]"
            >
              <SparklesIcon className="size-4" />
              <span>{overview.createActionLabel}</span>
            </button>
          </div>
        </div>
      ) : null}
      {showBottomNav ? <BottomNav current="routine" /> : null}
    </div>
  );
}

function RoutineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-white/15 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm">
      <p className="text-[10px] font-bold leading-none text-white/70">{label}</p>
      <p className="mt-1.5 text-[14px] font-black leading-none text-white">
        {value}
      </p>
    </div>
  );
}

function extractFirstNumber(value?: string) {
  const match = value?.match(/\d+/);

  return match ? Number(match[0]) : 0;
}

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}
