import Link from "next/link";
import { ClockIcon, FireIcon } from "@/components/icons";
import type { HomeDashboard } from "../types";

type WorkoutFocusSectionProps = {
  workout: HomeDashboard["workout"];
};

export function WorkoutFocusSection({
  workout,
}: WorkoutFocusSectionProps) {
  return (
    <section className="rounded-[28px] border border-indigo-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-black leading-none text-slate-900">
            {workout.title}
          </h2>
          <p className="text-sm text-slate-500">{workout.routine}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-right">
          <p className="text-[11px] font-medium text-slate-400">진행률</p>
          <p className="text-sm font-black text-indigo-600">
            {workout.progressLabel}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
          <ClockIcon className="size-4" />
          {workout.duration}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-500">
          <FireIcon className="size-4" />
          {workout.calories}
        </span>
      </div>

      <Link
        href="/today-workout-log"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        이어서 운동 기록하기
      </Link>
    </section>
  );
}
