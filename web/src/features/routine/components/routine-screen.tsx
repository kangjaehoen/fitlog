"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BoltIcon,
  ChevronLeftIcon,
  DumbbellIcon,
  SearchIcon,
  SparklesIcon,
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
    badge: "bg-indigo-50 text-indigo-600",
    icon: "text-indigo-500",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-600",
    icon: "text-emerald-500",
  },
  orange: {
    badge: "bg-orange-50 text-orange-600",
    icon: "text-orange-500",
  },
} as const;

const buttonStyles = {
  dark: "bg-slate-800 text-white shadow-lg shadow-slate-200",
  muted: "bg-slate-100 text-slate-700",
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
      : "pb-[220px]"
    : "pb-40";
  const createActionBottomClass = showBottomNav ? "bottom-[78px]" : "bottom-0";

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
    <div className={`min-h-screen bg-slate-50 ${bottomPaddingClass}`}>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-md items-center px-4 py-4">
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

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={overview.searchPlaceholder}
            aria-label="루틴 검색"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {searchTerm.trim()
                ? `검색 결과 (${filteredRoutines.length})`
                : `내 루틴 (${routines.length})`}
            </h2>
            <button
              type="button"
              onClick={handleToggleManageMode}
              disabled={routines.length === 0}
              className="text-[11px] font-bold text-indigo-600 transition hover:text-indigo-800"
            >
              {manageMode ? "완료" : overview.editLabel}
            </button>
          </div>
          {manageMode ? (
            <p className="px-1 text-[11px] font-medium text-slate-400">
              루틴 순서를 바꾸거나 삭제할 수 있습니다.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}

          {filteredRoutines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm font-bold text-slate-400">
              검색 결과가 없습니다.
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
                className={`space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition duration-200 active:scale-[0.98] ${
                  routine.subdued ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {routine.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tone.badge}`}
                      >
                        {routine.frequencyLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{routine.description}</p>
                  </div>

                  {!routine.disabled ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/routine-edit?routineId=${routine.id}`)}
                      aria-label={`${routine.title} 루틴 편집`}
                      className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600 transition hover:bg-indigo-100"
                    >
                      루틴 편집
                    </button>
                  ) : null}
                </div>

                {routine.exerciseSummary && routine.duration ? (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full bg-white shadow-sm ${tone.icon}`}
                      >
                        <MetaIcon className="size-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {routine.exerciseSummary}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {routine.duration}
                    </span>
                  </div>
                ) : null}

                {manageMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMoveRoutine(routine.id, -1)}
                      disabled={pendingAction || routineIndex <= 0}
                      className="rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      위로
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMoveRoutine(routine.id, 1)}
                      disabled={pendingAction || routineIndex === routines.length - 1}
                      className="rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      아래로
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteRoutine(routine)}
                      disabled={pendingAction}
                      className="rounded-xl bg-rose-50 py-3 text-xs font-bold text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
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
                    className={`w-full rounded-2xl py-4 text-sm font-bold transition-transform ${
                      routine.disabled ? "" : "active:scale-[0.98]"
                    } ${buttonClass}`}
                  >
                    {overview.startActionLabel}
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
          <div className="mx-auto max-w-md bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-6 pt-10">
            <button
              type="button"
              onClick={() => router.push("/routine-edit?mode=create")}
              className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-600 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(79,70,229,0.3)] transition-transform active:scale-[0.97]"
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

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}
