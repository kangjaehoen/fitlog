"use client";

import { useRouter } from "next/navigation";
import {
  BoltIcon,
  ChevronLeftIcon,
  DumbbellIcon,
  MoreVerticalIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons";
import type { RoutineOverview } from "../types";

type RoutineScreenProps = {
  overview: RoutineOverview;
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

export function RoutineScreen({ overview }: RoutineScreenProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-40">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-md items-center px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="inline-flex size-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <h1 className="pointer-events-none absolute inset-x-0 text-center text-base font-bold text-slate-900">
            운동 루틴
          </h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={overview.searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {overview.sectionTitle}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/routine-edit")}
              className="text-[11px] font-bold text-indigo-600 transition hover:text-indigo-800"
            >
              {overview.editLabel}
            </button>
          </div>

          {overview.routines.map((routine) => {
            const tone = toneStyles[routine.tone];
            const buttonClass = buttonStyles[routine.buttonVariant];
            const MetaIcon = routine.icon === "bolt" ? BoltIcon : DumbbellIcon;

            return (
              <article
                key={routine.title}
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
                      aria-label={`${routine.title} 옵션`}
                      className="p-1 text-slate-300 transition hover:text-slate-500"
                    >
                      <MoreVerticalIcon className="size-4" />
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

                <button
                  type="button"
                  disabled={routine.disabled}
                  onClick={() =>
                    !routine.disabled ? router.push("/today-workout-log") : undefined
                  }
                  className={`w-full rounded-2xl py-4 text-sm font-bold transition-transform ${
                    routine.disabled ? "" : "active:scale-[0.98]"
                  } ${buttonClass}`}
                >
                  {overview.startActionLabel}
                </button>
              </article>
            );
          })}
        </section>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-md bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-6 pt-10">
          <button
            type="button"
            onClick={() => router.push("/routine-edit")}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-600 py-4 text-sm font-bold text-white shadow-[0_8px_25px_rgba(79,70,229,0.3)] transition-transform active:scale-[0.97]"
          >
            <SparklesIcon className="size-4" />
            <span>{overview.createActionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
