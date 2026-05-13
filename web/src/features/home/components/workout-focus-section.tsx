"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClockIcon, FireIcon } from "@/components/icons";
import { hasTodayWorkoutDraft } from "@/features/recording/workout-draft-storage";
import type { HomeDashboard } from "../types";

type WorkoutFocusSectionProps = {
  workout: HomeDashboard["workout"];
};

const START_ACTION_LABEL = "오늘 운동 시작하기";
const CONTINUE_ACTION_LABEL = "이어서 운동 기록하기";
const SERVER_VIEW_ACTION_LABEL = "오늘 운동 기록 보기";
const VIEW_ACTION_LABEL = "운동 기록 보기";

function isCompletedWorkout(workout: HomeDashboard["workout"]) {
  if (
    workout.actionLabel === SERVER_VIEW_ACTION_LABEL ||
    workout.actionLabel === VIEW_ACTION_LABEL
  ) {
    return true;
  }

  const [completedText, totalText] = workout.progressLabel.split("/");
  const completed = Number(completedText);
  const total = Number(totalText?.replace(/\D/g, ""));

  return Number.isFinite(completed) && total > 0 && completed >= total;
}

function actionLabelFor(workout: HomeDashboard["workout"]) {
  if (isCompletedWorkout(workout)) {
    return VIEW_ACTION_LABEL;
  }

  return workout.actionLabel ?? START_ACTION_LABEL;
}

export function WorkoutFocusSection({
  workout,
}: WorkoutFocusSectionProps) {
  const [actionLabel, setActionLabel] = useState(actionLabelFor(workout));

  useEffect(() => {
    const draftCheckTimer = window.setTimeout(() => {
      setActionLabel(
        !isCompletedWorkout(workout) && hasTodayWorkoutDraft()
          ? CONTINUE_ACTION_LABEL
          : actionLabelFor(workout),
      );
    }, 0);

    return () => window.clearTimeout(draftCheckTimer);
  }, [workout]);

  return (
    <section className="rounded-[28px] border border-[#c7d2fe] bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-[8px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-3">
          <h2 className="text-[18px] font-black leading-none text-slate-900">
            {workout.title}
          </h2>
          <p className="text-sm text-slate-500">{workout.routine}</p>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
          <p className="leading-none">{workout.progressLabel}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2.5 text-[14px] text-slate-600">
          <ClockIcon className="size-4" />
          {workout.duration}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3.5 py-2.5 text-[14px] text-orange-500">
          <FireIcon className="size-4" />
          {workout.calories}
        </span>
      </div>

      <Link
        href="/today-workout-log"
        className="inline-flex w-full items-center justify-center rounded-[22px] bg-indigo-600 px-4 py-[14px] text-sm font-extrabold text-white transition hover:bg-indigo-700"
      >
        {actionLabel}
      </Link>
    </section>
  );
}
