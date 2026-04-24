"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BoltIcon,
  CheckCircleIcon,
  ClockIcon,
  DumbbellIcon,
  FireIcon,
  SearchIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { WorkoutLogData } from "../types";

type WorkoutLogScreenProps = {
  data: WorkoutLogData;
};

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function WorkoutLogScreen({ data }: WorkoutLogScreenProps) {
  const [seconds, setSeconds] = useState(data.initialDurationSeconds);
  const [running, setRunning] = useState(true);
  const [exerciseName, setExerciseName] = useState(data.exerciseName);
  const [intensity, setIntensity] = useState(data.intensityOptions[1] ?? "");
  const [sets, setSets] = useState(data.routineTemplate);
  const [completedExercises, setCompletedExercises] = useState(data.completedExercises);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const totalCalories = useMemo(
    () =>
      completedExercises.reduce((sum, exercise) => sum + exercise.calories, 0),
    [completedExercises],
  );

  const saveCurrentExercise = () => {
    const finishedSets = sets.filter((set) => set.done);
    const totalVolume = finishedSets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0,
    );

    setCompletedExercises((previous) => [
      ...previous,
      {
        title: exerciseName.trim() || "새 운동",
        summary: `${finishedSets.length}세트 · 총 ${totalVolume.toLocaleString()}kg 볼륨`,
        time: "지금",
        calories: Math.max(90, finishedSets.length * 55),
        icon: "strength",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <StackHeader title="운동 기록하기" fallbackHref="/" />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-4">
        <section className="relative overflow-hidden rounded-[30px] bg-slate-800 p-6 text-white shadow-xl">
          <div className="absolute -top-6 -right-6 size-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">
              {data.sessionLabel}
            </span>
            <div
              className={`mb-4 text-4xl font-black tracking-wider ${
                running ? "animate-pulse" : ""
              }`}
            >
              {formatClock(seconds)}
            </div>

            <div className="mt-2 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setRunning((previous) => !previous)}
                className="flex-1 rounded-xl bg-white/10 py-3 text-xs font-bold transition hover:bg-white/20"
              >
                {running ? "일시정지" : "다시 시작"}
              </button>
              <button
                type="button"
                onClick={() => setSeconds(0)}
                className="flex-1 rounded-xl bg-indigo-500 py-3 text-xs font-bold shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-600"
              >
                초기화
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800">
              현재 운동 기록
            </h2>
            <button
              type="button"
              onClick={() => setSets(data.routineTemplate)}
              className="rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600"
            >
              {data.routineActionLabel}
            </button>
          </div>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={exerciseName}
              onChange={(event) => setExerciseName(event.target.value)}
              placeholder={data.searchPlaceholder}
              className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase text-slate-400">
              <span>세트</span>
              <span>kg</span>
              <span>회</span>
              <span>완료</span>
            </div>

            {sets.map((set, index) => (
              <div
                key={`set-${index}`}
                className={`grid grid-cols-4 gap-2 items-center ${
                  set.done ? "" : "opacity-70"
                }`}
              >
                <div className="rounded-lg bg-white py-2 text-center text-sm font-bold text-slate-600">
                  {index + 1}
                </div>
                <input
                  type="number"
                  value={set.weight}
                  onChange={(event) =>
                    setSets((previous) =>
                      previous.map((item, currentIndex) =>
                        currentIndex === index
                          ? { ...item, weight: Number(event.target.value || 0) }
                          : item,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white py-2 text-center text-sm font-bold text-slate-800 outline-none"
                />
                <input
                  type="number"
                  value={set.reps}
                  onChange={(event) =>
                    setSets((previous) =>
                      previous.map((item, currentIndex) =>
                        currentIndex === index
                          ? { ...item, reps: Number(event.target.value || 0) }
                          : item,
                      ),
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white py-2 text-center text-sm font-bold text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSets((previous) =>
                      previous.map((item, currentIndex) =>
                        currentIndex === index
                          ? { ...item, done: !item.done }
                          : item,
                      ),
                    )
                  }
                  className={`flex items-center justify-center rounded-lg py-2 ${
                    set.done
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <CheckCircleIcon className="size-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setSets((previous) => [...previous, { weight: 0, reps: 0 }])
              }
              className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-400 transition hover:bg-white"
            >
              + 세트 추가
            </button>
          </div>

          <div className="space-y-4 rounded-2xl bg-white ring-1 ring-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              오늘의 운동 강도
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {data.intensityOptions.map((option) => {
                const active = option === intensity;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIntensity(option)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                        : "border-slate-100 bg-white text-slate-500"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={saveCurrentExercise}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98]"
          >
            {data.addActionLabel}
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800">오늘 완료한 운동</h2>
            <span className="text-[11px] font-bold uppercase tracking-tight text-indigo-600">
              총 {totalCalories} kcal 소모
            </span>
          </div>

          <div className="space-y-3">
            {completedExercises.map((exercise) => {
              const Icon =
                exercise.icon === "cardio" ? BoltIcon : DumbbellIcon;

              return (
                <article
                  key={`${exercise.title}-${exercise.time}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-800">
                      {exercise.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {exercise.summary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-300">
                      {exercise.time}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                      {exercise.calories} kcal
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="size-4" />
              오늘 총 운동 시간 {Math.floor(seconds / 60)}분
            </span>
            <span className="inline-flex items-center gap-1 text-indigo-600">
              <FireIcon className="size-4" />
              SAVE & FINISH
            </span>
          </div>
          <button
            type="button"
            className="w-full rounded-2xl bg-slate-800 py-4 text-base font-bold text-white transition-transform active:scale-[0.98]"
          >
            {data.finishActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
