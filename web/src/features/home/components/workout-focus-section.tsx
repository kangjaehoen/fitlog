"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  FireIcon,
} from "@/components/icons";
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

function statusLabelFor(
  workout: HomeDashboard["workout"],
  actionLabel: string,
) {
  if (isCompletedWorkout(workout)) {
    return "완료";
  }

  if (
    actionLabel === CONTINUE_ACTION_LABEL ||
    workout.progressLabel.includes("진행")
  ) {
    return "진행중";
  }

  if (workout.progressLabel === "0/0 완료") {
    return "대기";
  }

  return workout.progressLabel;
}

export function WorkoutFocusSection({
  workout,
}: WorkoutFocusSectionProps) {
  const [actionLabel, setActionLabel] = useState(actionLabelFor(workout));
  const statusLabel = statusLabelFor(workout, actionLabel);
  const compactCalories = workout.calories.replace(/\s+/g, "");

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
    <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5">
            <span className="grid size-4 place-items-center rounded-full bg-[#7563f1] text-white">
              <DumbbellIcon className="size-2.5" />
            </span>
            <h2 className="text-[13px] font-black leading-none text-[#22243d]">
              {workout.title}
            </h2>
          </div>
          <p className="mt-2 text-[12px] font-medium text-[#69708a]">
            {workout.routine}
          </p>
        </div>
        <div className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black text-[#6653e9]">
          <p className="leading-none">{statusLabel}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-[12px] font-extrabold">
        <span className="inline-flex items-center gap-1.5 text-[#4f59c9]">
          <span className="grid size-5 place-items-center rounded-full bg-[#f2f3ff]">
            <ClockIcon className="size-3.5" />
          </span>
          {workout.duration}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#ff5f4f]">
          <span className="grid size-5 place-items-center rounded-full bg-[#fff0ec]">
            <FireIcon className="size-3.5" />
          </span>
          {compactCalories}
        </span>
      </div>

      <Link
        href="/today-workout-log"
        className="inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#8876fb,#6150dc)] px-4 text-[12px] font-black text-white shadow-[0_12px_22px_rgba(97,80,220,0.24)] transition hover:-translate-y-0.5"
      >
        <span className="flex-1 text-center">{actionLabel}</span>
        <ChevronRightIcon className="size-4" />
      </Link>
    </section>
  );
}
