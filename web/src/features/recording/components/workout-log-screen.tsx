"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BoltIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
  FireIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import { recordWorkout, type WorkoutRecordPayload } from "../api";
import type { WorkoutLogData } from "../types";
import {
  clearWorkoutDraftState,
  loadWorkoutDraftState,
  saveWorkoutDraftState,
  type CompletedWorkoutExercise,
  type WorkoutSetDraft,
} from "../workout-draft-storage";

type WorkoutLogScreenProps = {
  data: WorkoutLogData;
};

type RoutineExerciseTemplate = {
  name: string;
  sets: WorkoutSetDraft[];
};

type RoutineExerciseDraft = RoutineExerciseTemplate & {
  draftId: string;
};

const INTENSITY_BY_LABEL: Record<string, WorkoutRecordPayload["intensity"]> = {
  쉬움: "EASY",
  적당함: "MODERATE",
  "매우 힘듦": "HARD",
};

function cloneSets(sets: WorkoutSetDraft[]) {
  return sets.map((set) => ({ ...set }));
}

function nextSetFromLast(sets: WorkoutSetDraft[]) {
  const lastSet = sets[sets.length - 1];

  return {
    weight: lastSet?.weight ?? 0,
    reps: lastSet?.reps ?? 0,
  };
}

function cloneRoutineExercises(
  exercises: RoutineExerciseTemplate[],
): RoutineExerciseDraft[] {
  return exercises.map((exercise, index) => ({
    draftId: `routine-${index}`,
    name: exercise.name,
    sets: cloneSets(exercise.sets),
  }));
}

function createAdditionalRoutineExercise(index: number): RoutineExerciseDraft {
  return {
    draftId: `additional-${Date.now()}-${index}`,
    name: "추가 운동",
    sets: [{ weight: 0, reps: 0 }],
  };
}

function formatWeight(weight: number) {
  const numericWeight = Number(weight);
  if (!Number.isFinite(numericWeight)) {
    return "0";
  }

  return Number.isInteger(numericWeight)
    ? String(numericWeight)
    : numericWeight.toFixed(1).replace(/\.0$/, "");
}

function setPreviewLabel(sets: WorkoutSetDraft[]) {
  const firstSet = sets[0];
  if (!firstSet) {
    return "세트 없음";
  }

  return `${sets.length}세트 · ${formatWeight(firstSet.weight)}kg x ${
    firstSet.reps
  }회`;
}

function finishedSets(sets: WorkoutSetDraft[]) {
  return sets.filter((set) => set.done);
}

function totalVolume(sets: WorkoutSetDraft[]) {
  return sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
}

function toCompletedExercise(
  name: string,
  sets: WorkoutSetDraft[],
): CompletedWorkoutExercise | null {
  const completedSets = finishedSets(sets);
  if (completedSets.length === 0) {
    return null;
  }

  const volume = totalVolume(completedSets);
  const savedSets = completedSets.map((set) => ({
    done: true,
    reps: set.reps,
    weight: set.weight,
  }));

  return {
    title: name.trim() || "새 운동",
    summary: `${completedSets.length}세트 · 총 ${volume.toLocaleString()}kg 볼륨`,
    time: "지금",
    calories: Math.max(90, completedSets.length * 55),
    icon: "strength",
    persistable: true,
    sets: savedSets,
  };
}

function workoutRoutineExercises(data: WorkoutLogData): RoutineExerciseTemplate[] {
  if (data.routineExercises?.length) {
    return data.routineExercises.map((exercise) => ({
      name: exercise.name,
      sets: cloneSets(exercise.sets),
    }));
  }

  if (data.exerciseName || data.routineTemplate.length > 0) {
    return [
      {
        name: data.exerciseName || "새 운동",
        sets: cloneSets(data.routineTemplate),
      },
    ];
  }

  return [];
}

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function WorkoutLogScreen({ data }: WorkoutLogScreenProps) {
  const router = useRouter();
  const routineExercises = useMemo(() => workoutRoutineExercises(data), [data]);
  const initialRoutineExercise = routineExercises[0];
  const [seconds, setSeconds] = useState(data.initialDurationSeconds);
  const [running, setRunning] = useState(true);
  const [exerciseName, setExerciseName] = useState(
    initialRoutineExercise?.name ?? data.exerciseName,
  );
  const [intensity, setIntensity] = useState(data.intensityOptions[1] ?? "");
  const [sets, setSets] = useState<WorkoutSetDraft[]>(
    cloneSets(initialRoutineExercise?.sets ?? data.routineTemplate),
  );
  const [routineExerciseDrafts, setRoutineExerciseDrafts] = useState<
    RoutineExerciseDraft[]
  >(() => cloneRoutineExercises(routineExercises));
  const [expandedRoutineIndexes, setExpandedRoutineIndexes] = useState<
    number[]
  >(() => (routineExercises.length > 0 ? [0] : []));
  const [completedExercises, setCompletedExercises] = useState<
    CompletedWorkoutExercise[]
  >(() =>
    data.completedExercises.map((exercise) => ({
      ...exercise,
      persistable: false,
      sets: [],
    })),
  );
  const [lastSavedDraftKey, setLastSavedDraftKey] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const draftRestoredRef = useRef(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      if (data.routineId) {
        const firstRoutineExercise = routineExercises[0];
        clearWorkoutDraftState();
        setSeconds(data.initialDurationSeconds);
        setRunning(true);
        setExerciseName(firstRoutineExercise?.name ?? data.exerciseName);
        setIntensity(data.intensityOptions[1] ?? "");
        setSets(cloneSets(firstRoutineExercise?.sets ?? data.routineTemplate));
        setRoutineExerciseDrafts(cloneRoutineExercises(routineExercises));
        setExpandedRoutineIndexes(routineExercises.length > 0 ? [0] : []);
        setCompletedExercises(
          data.completedExercises.map((exercise) => ({
            ...exercise,
            persistable: false,
            sets: [],
          })),
        );
        setLastSavedDraftKey(null);
        setErrorMessage(null);
        draftRestoredRef.current = true;
        return;
      }

      const draft = loadWorkoutDraftState();
      draftRestoredRef.current = true;
      if (!draft) {
        return;
      }

      const elapsedSeconds = draft.running
        ? Math.max(0, Math.floor((Date.now() - draft.savedAt) / 1000))
        : 0;

      setSeconds(Math.max(0, draft.seconds + elapsedSeconds));
      setRunning(draft.running);
      setExerciseName(draft.exerciseName);
      setIntensity(
        data.intensityOptions.includes(draft.intensity)
          ? draft.intensity
          : data.intensityOptions[1] ?? "",
      );
      setSets(
        draft.sets.length > 0 ? draft.sets : cloneSets(data.routineTemplate),
      );
      setCompletedExercises(draft.completedExercises);
      setLastSavedDraftKey(draft.lastSavedDraftKey);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, [
    data.completedExercises,
    data.exerciseName,
    data.initialDurationSeconds,
    data.intensityOptions,
    data.routineId,
    data.routineTemplate,
    routineExercises,
  ]);

  useEffect(() => {
    if (!draftRestoredRef.current || data.routineId) {
      return;
    }

    saveWorkoutDraftState({
      version: 1,
      savedAt: Date.now(),
      seconds,
      running,
      exerciseName,
      intensity,
      sets,
      completedExercises,
      lastSavedDraftKey,
    });
  }, [
    completedExercises,
    data.routineId,
    exerciseName,
    intensity,
    lastSavedDraftKey,
    running,
    seconds,
    sets,
  ]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const isRoutineMode = Boolean(data.routineId);

  const currentRoutineCompletedExercises = useMemo(() => {
    if (!isRoutineMode) {
      return [];
    }

    return routineExerciseDrafts
      .map((exercise) => toCompletedExercise(exercise.name, exercise.sets))
      .filter(
        (exercise): exercise is CompletedWorkoutExercise => exercise !== null,
      );
  }, [isRoutineMode, routineExerciseDrafts]);

  const displayedCompletedExercises = useMemo(
    () =>
      isRoutineMode
        ? [...completedExercises, ...currentRoutineCompletedExercises]
        : completedExercises,
    [completedExercises, currentRoutineCompletedExercises, isRoutineMode],
  );

  const totalCalories = useMemo(
    () =>
      displayedCompletedExercises.reduce(
        (sum, exercise) => sum + exercise.calories,
        0,
      ),
    [displayedCompletedExercises],
  );

  const currentDraftKey = () =>
    JSON.stringify({
      name: exerciseName.trim() || "새 운동",
      sets: sets
        .filter((set) => set.done)
        .map((set) => ({
          reps: set.reps,
          weight: set.weight,
        })),
    });

  const buildCurrentExercise = () => toCompletedExercise(exerciseName, sets);

  const saveCurrentExercise = () => {
    const exercise = buildCurrentExercise();
    if (!exercise) {
      setErrorMessage("완료 체크된 세트가 있어야 운동을 추가할 수 있습니다.");
      return;
    }

    setCompletedExercises((previous) => [...previous, exercise]);
    setLastSavedDraftKey(currentDraftKey());
    setErrorMessage(null);
  };

  const toggleRoutineExercise = (index: number) => {
    setExpandedRoutineIndexes((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  };

  const updateRoutineExerciseName = (exerciseIndex: number, name: string) => {
    setRoutineExerciseDrafts((previous) =>
      previous.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? { ...exercise, name }
          : exercise,
      ),
    );
    setErrorMessage(null);
  };

  const addRoutineExercise = () => {
    const nextIndex = routineExerciseDrafts.length;
    setRoutineExerciseDrafts((previous) => [
      ...previous,
      createAdditionalRoutineExercise(previous.length),
    ]);
    setExpandedRoutineIndexes((previous) =>
      Array.from(new Set([...previous, nextIndex])),
    );
    setErrorMessage(null);
  };

  const deleteRoutineExercise = (exerciseIndex: number) => {
    setRoutineExerciseDrafts((previous) =>
      previous.filter((_, currentExerciseIndex) => currentExerciseIndex !== exerciseIndex),
    );
    setExpandedRoutineIndexes((previous) =>
      previous
        .filter((index) => index !== exerciseIndex)
        .map((index) => (index > exerciseIndex ? index - 1 : index)),
    );
    setErrorMessage(null);
  };

  const updateRoutineSet = (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSetDraft>,
  ) => {
    setRoutineExerciseDrafts((previous) =>
      previous.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, ...updates } : set,
              ),
            }
          : exercise,
      ),
    );
    setErrorMessage(null);
  };

  const deleteRoutineSet = (exerciseIndex: number, setIndex: number) => {
    setRoutineExerciseDrafts((previous) =>
      previous.map((exercise, currentExerciseIndex) =>
        currentExerciseIndex === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.filter(
                (_, currentSetIndex) => currentSetIndex !== setIndex,
              ),
            }
          : exercise,
      ),
    );
    setErrorMessage(null);
  };

  const addRoutineSet = (exerciseIndex: number) => {
    setRoutineExerciseDrafts((previous) =>
      previous.map((exercise, currentExerciseIndex) => {
        if (currentExerciseIndex !== exerciseIndex) {
          return exercise;
        }

        return {
          ...exercise,
          sets: [...exercise.sets, nextSetFromLast(exercise.sets)],
        };
      }),
    );
    setErrorMessage(null);
  };

  const handleFinishWorkout = async () => {
    const persistedExercises = completedExercises.filter(
      (exercise) => exercise.persistable,
    );
    const currentExercise = isRoutineMode ? null : buildCurrentExercise();
    const exercises = isRoutineMode
      ? currentRoutineCompletedExercises
      : currentExercise && currentDraftKey() !== lastSavedDraftKey
        ? [...persistedExercises, currentExercise]
        : persistedExercises;

    if (exercises.length === 0) {
      setErrorMessage("저장할 완료 세트가 없습니다. 세트 완료 체크 후 다시 시도해주세요.");
      return;
    }

    setSaving(true);
    setRunning(false);
    setErrorMessage(null);

    try {
      await recordWorkout(
        {
          durationMinutes: Math.max(0, Math.round(seconds / 60)),
          caloriesBurned: exercises.reduce(
            (sum, exercise) => sum + exercise.calories,
            0,
          ),
          intensity: INTENSITY_BY_LABEL[intensity] ?? "MODERATE",
          exercises: exercises.map((exercise) => ({
            name: exercise.title,
            sets: exercise.sets.map((set) => ({
              weightKg: set.weight,
              repetitions: set.reps,
              completed: Boolean(set.done),
            })),
          })),
        },
        getPersistedAuthToken(),
      );

      clearWorkoutDraftState();
      router.replace("/main");
    } catch (error) {
      setSaving(false);
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해주세요."
          : "운동 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
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
              {isRoutineMode ? "불러온 루틴 기록" : "현재 운동 기록"}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/fitness-routine?source=workout-log")}
              className="rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold text-indigo-600"
            >
              {data.routineActionLabel}
            </button>
          </div>

          {isRoutineMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-indigo-50/60 p-3">
                <div>
                  <p className="text-[11px] font-bold text-indigo-700">
                    불러온 루틴
                  </p>
                  <p className="text-[10px] font-bold text-indigo-400">
                    {routineExerciseDrafts.length}개 운동
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-indigo-600 shadow-sm">
                    {currentRoutineCompletedExercises.length}개 기록 중
                  </span>
                  <button
                    type="button"
                    onClick={addRoutineExercise}
                    className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition active:scale-95"
                    aria-label="운동 추가"
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>
              </div>

              {routineExerciseDrafts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-center">
                  <p className="text-sm font-bold text-slate-700">
                    오늘 기록할 운동이 없습니다
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-slate-400">
                    운동 추가 버튼으로 오늘 할 종목을 넣어주세요.
                  </p>
                </div>
              ) : null}

              {routineExerciseDrafts.map((exercise, exerciseIndex) => {
                const expanded = expandedRoutineIndexes.includes(exerciseIndex);
                const completedSets = finishedSets(exercise.sets);
                const completedSetCount = completedSets.length;
                const volume = totalVolume(completedSets);

                return (
                  <article
                    key={exercise.draftId}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                      expanded ? "border-indigo-100" : "border-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleRoutineExercise(exerciseIndex)}
                      className="flex w-full items-center gap-3 p-4 text-left"
                      aria-expanded={expanded}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600">
                        {exerciseIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-800">
                          {exercise.name || "이름 없는 운동"}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-bold text-slate-400">
                          {setPreviewLabel(exercise.sets)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-black ${
                            completedSetCount > 0
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {completedSetCount}/{exercise.sets.length}
                        </span>
                        <ChevronRightIcon
                          className={`size-4 text-slate-300 transition ${
                            expanded ? "rotate-90" : ""
                          }`}
                        />
                      </span>
                    </button>

                    {expanded ? (
                      <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(event) =>
                              updateRoutineExerciseName(
                                exerciseIndex,
                                event.target.value,
                              )
                            }
                            placeholder="운동 이름"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => deleteRoutineExercise(exerciseIndex)}
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition active:scale-95"
                            aria-label={`${exercise.name || "운동"} 삭제`}
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_40px_40px] gap-2 text-center text-[10px] font-bold uppercase text-slate-400">
                          <span>세트</span>
                          <span>kg</span>
                          <span>회</span>
                          <span>완료</span>
                          <span>삭제</span>
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={`${exercise.draftId}-set-${setIndex}`}
                            className={`grid grid-cols-[36px_minmax(0,1fr)_minmax(0,1fr)_40px_40px] items-center gap-2 ${
                              set.done ? "" : "opacity-75"
                            }`}
                          >
                            <div className="rounded-lg bg-white py-2 text-center text-sm font-bold text-slate-600">
                              {setIndex + 1}
                            </div>
                            <input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              value={set.weight}
                              onChange={(event) =>
                                updateRoutineSet(exerciseIndex, setIndex, {
                                  weight: Number(event.target.value || 0),
                                })
                              }
                              className="min-w-0 rounded-lg border border-slate-200 bg-white py-2 text-center text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={set.reps}
                              onChange={(event) =>
                                updateRoutineSet(exerciseIndex, setIndex, {
                                  reps: Number(event.target.value || 0),
                                })
                              }
                              className="min-w-0 rounded-lg border border-slate-200 bg-white py-2 text-center text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateRoutineSet(exerciseIndex, setIndex, {
                                  done: !set.done,
                                })
                              }
                              aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 완료`}
                              className={`flex h-10 items-center justify-center rounded-lg ${
                                set.done
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              <CheckCircleIcon className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoutineSet(exerciseIndex, setIndex)}
                              className="flex h-10 items-center justify-center rounded-lg bg-white text-slate-300 transition hover:text-rose-500"
                              aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 삭제`}
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-400">
                          <span>완료 {completedSetCount}세트</span>
                          <span>총 {volume.toLocaleString()}kg</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => addRoutineSet(exerciseIndex)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-400 transition hover:bg-white"
                        >
                          <PlusIcon className="size-4" />
                          <span>세트 추가</span>
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}

              <button
                type="button"
                onClick={addRoutineExercise}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-100 bg-indigo-50/50 py-4 text-sm font-bold text-indigo-600 transition active:scale-[0.99]"
              >
                <PlusIcon className="size-4" />
                <span>운동 추가</span>
              </button>
            </div>
          ) : (
            <>
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
                      inputMode="decimal"
                      min="0"
                      value={set.weight}
                      onChange={(event) =>
                        setSets((previous) =>
                          previous.map((item, currentIndex) =>
                            currentIndex === index
                              ? {
                                  ...item,
                                  weight: Number(event.target.value || 0),
                                }
                              : item,
                          ),
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white py-2 text-center text-sm font-bold text-slate-800 outline-none"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
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
                      aria-label={`${exerciseName || "새 운동"} ${index + 1}세트 완료`}
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
                    setSets((previous) => [...previous, nextSetFromLast(previous)])
                  }
                  className="w-full rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-400 transition hover:bg-white"
                >
                  + 세트 추가
                </button>
              </div>
            </>
          )}

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

          {!isRoutineMode ? (
            <button
              type="button"
              onClick={saveCurrentExercise}
              className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98]"
            >
              {data.addActionLabel}
            </button>
          ) : null}
          {errorMessage ? (
            <p className="text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800">오늘 완료한 운동</h2>
            <span className="text-[11px] font-bold uppercase tracking-tight text-indigo-600">
              총 {totalCalories} kcal 소모
            </span>
          </div>

          <div className="space-y-3">
            {displayedCompletedExercises.map((exercise, index) => {
              const Icon =
                exercise.icon === "cardio" ? BoltIcon : DumbbellIcon;

              return (
                <article
                  key={`${exercise.title}-${exercise.time}-${index}`}
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
            onClick={() => void handleFinishWorkout()}
            disabled={saving}
            className={`w-full rounded-2xl bg-slate-800 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] ${
              saving ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {saving ? "운동 기록 저장 중" : data.finishActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
