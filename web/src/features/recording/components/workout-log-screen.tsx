"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BoltIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  DumbbellIcon,
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

function formatDurationLabel(totalSeconds: number) {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${totalMinutes}분`;
  }

  return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
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

  const activeCompletedSets = useMemo(() => finishedSets(sets), [sets]);
  const activeCompletedSetCount = activeCompletedSets.length;
  const activeWorkoutVolume = useMemo(
    () => totalVolume(activeCompletedSets),
    [activeCompletedSets],
  );
  const sessionStatusLabel =
    data.sessionLabel === "Workout Session" ? "오늘 운동 중" : data.sessionLabel;
  const totalWorkoutTimeLabel = formatDurationLabel(seconds);

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
    <div className="min-h-screen bg-[#f8f8ff] pb-[148px] text-slate-950">
      <StackHeader title="운동 기록하기" fallbackHref="/" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-5 px-4 pb-4 pt-3">
        <section className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#8b5cf6_0%,#6750f2_54%,#4f46e5_100%)] px-5 py-5 text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)]">
          <div className="pointer-events-none absolute right-3 top-5 hidden size-24 rotate-[-18deg] items-center justify-center rounded-[20px] border border-white/15 bg-white/10 text-white/45 shadow-inner sm:flex">
            <DumbbellIcon className="size-12" />
          </div>

          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-2 text-[13px] font-bold text-white/95">
              <span className="size-2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.14)]" />
              <span>{sessionStatusLabel}</span>
            </div>

            <div
              className={`text-[42px] font-black leading-none text-white drop-shadow-sm ${
                running ? "animate-pulse" : ""
              }`}
            >
              {formatClock(seconds)}
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setRunning((previous) => !previous)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 text-[13px] font-bold text-indigo-600 shadow-[0_10px_18px_rgba(49,46,129,0.12)] transition active:scale-[0.98]"
              >
                <span
                  aria-hidden="true"
                  className="flex size-4 items-center justify-center gap-1"
                >
                  {running ? (
                    <>
                      <span className="h-4 w-1.5 rounded-full bg-current" />
                      <span className="h-4 w-1.5 rounded-full bg-current" />
                    </>
                  ) : (
                    <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current" />
                  )}
                </span>
                <span>{running ? "일시정지" : "다시 시작"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSeconds(0)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 text-[13px] font-bold text-indigo-600 shadow-[0_10px_18px_rgba(49,46,129,0.12)] transition active:scale-[0.98]"
              >
                <span
                  aria-hidden="true"
                  className="relative size-4 rounded-full border-2 border-current border-l-transparent"
                >
                  <span className="absolute -right-0.5 top-0 h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-current" />
                </span>
                <span>초기화</span>
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-black leading-tight text-slate-950">
              {isRoutineMode ? "불러온 루틴 기록" : "현재 운동 기록"}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/fitness-routine?source=workout-log")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 text-xs font-bold text-indigo-600 shadow-[0_8px_16px_rgba(79,70,229,0.08)] transition active:scale-[0.98]"
            >
              <PlusIcon className="size-4" />
              <span>{data.routineActionLabel}</span>
            </button>
          </div>

          <div className="space-y-3.5 rounded-[16px] border border-indigo-100/70 bg-white p-3.5 shadow-[0_10px_24px_rgba(37,45,100,0.08)]">
          {isRoutineMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-[14px] bg-indigo-50/60 p-2.5">
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
                <div className="rounded-[15px] border border-dashed border-slate-200 bg-white p-4 text-center">
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
                    className={`overflow-hidden rounded-[14px] border bg-white shadow-sm transition ${
                      expanded ? "border-indigo-100" : "border-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleRoutineExercise(exerciseIndex)}
                      className="flex w-full items-center gap-3 p-3 text-left"
                      aria-expanded={expanded}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-[11px] font-black text-slate-600">
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
                      <div className="space-y-2.5 border-t border-slate-100 bg-slate-50 p-2.5">
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
                            className="h-9 min-w-0 flex-1 rounded-[10px] border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => deleteRoutineExercise(exerciseIndex)}
                            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-50 text-rose-500 transition active:scale-95"
                            aria-label={`${exercise.name || "운동"} 삭제`}
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_36px_36px] gap-1.5 text-center text-[10px] font-bold uppercase text-slate-400">
                          <span>세트</span>
                          <span>kg</span>
                          <span>회</span>
                          <span>완료</span>
                          <span>삭제</span>
                        </div>

                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={`${exercise.draftId}-set-${setIndex}`}
                            className={`grid grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)_36px_36px] items-center gap-1.5 ${
                              set.done ? "" : "opacity-75"
                            }`}
                          >
                            <div className="rounded-lg bg-white py-1.5 text-center text-xs font-bold text-slate-600">
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
                              className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white text-center text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                              className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white text-center text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateRoutineSet(exerciseIndex, setIndex, {
                                  done: !set.done,
                                })
                              }
                              aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 완료`}
                              className={`flex h-9 items-center justify-center rounded-lg ${
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
                              className="flex h-9 items-center justify-center rounded-lg bg-white text-slate-300 transition hover:text-rose-500"
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
                          className="flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white"
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
                className="flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-indigo-100 bg-indigo-50/50 py-3 text-[13px] font-bold text-indigo-600 transition active:scale-[0.99]"
              >
                <PlusIcon className="size-4" />
                <span>운동 추가</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#8b5cf6,#4f46e5)] text-white shadow-[0_10px_20px_rgba(79,70,229,0.20)]">
                  <DumbbellIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[18px] font-black leading-tight text-slate-950">
                    {exerciseName.trim() || "운동 종목"}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    목표 {sets.length}세트 · 현재 {activeCompletedSetCount}세트 완료
                  </p>
                </div>
              </div>

              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(event) => setExerciseName(event.target.value)}
                  placeholder={data.searchPlaceholder}
                  className="h-[52px] w-full rounded-[14px] border border-indigo-100 bg-white py-0 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/80"
                />
              </div>

              <div className="space-y-1.5 overflow-hidden rounded-[14px] border border-indigo-100 bg-white">
                <div className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px_44px] bg-[#f5f2ff] px-2 py-2.5 text-center text-xs font-semibold text-slate-600">
                  <span>세트</span>
                  <span>kg</span>
                  <span>회</span>
                  <span>완료</span>
                  <span>삭제</span>
                </div>

                {sets.map((set, index) => (
                  <div
                    key={`set-${index}`}
                    className={`grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px_44px] items-center gap-1.5 border-t border-indigo-50 px-2 py-2 ${
                      set.done ? "" : "opacity-70"
                    }`}
                  >
                    <div className="py-1.5 text-center text-sm font-semibold text-slate-700">
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
                      className="h-10 min-w-0 rounded-[10px] border border-transparent bg-white py-0 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-200 focus:bg-indigo-50/40"
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
                      className="h-10 min-w-0 rounded-[10px] border border-transparent bg-white py-0 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-200 focus:bg-indigo-50/40"
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
                      className={`mx-auto flex size-9 items-center justify-center rounded-full transition active:scale-95 ${
                        set.done
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CheckCircleIcon className="size-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSets((previous) =>
                          previous.filter((_, currentIndex) => currentIndex !== index),
                        )
                      }
                      aria-label={`${exerciseName || "새 운동"} ${index + 1}세트 삭제`}
                      className="mx-auto flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition active:scale-95"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setSets((previous) => [...previous, nextSetFromLast(previous)])
                  }
                  className="m-1.5 flex h-11 w-[calc(100%-0.75rem)] items-center justify-center gap-2 rounded-[12px] border border-dashed border-indigo-200 bg-white text-sm font-bold text-indigo-600 transition active:scale-[0.99]"
                >
                  <PlusIcon className="size-4" />
                  <span>세트 추가</span>
                </button>
              </div>

              <div className="flex items-center justify-between rounded-[14px] bg-[#faf9ff] px-3 py-2.5 text-xs font-bold text-slate-600">
                <span>현재 볼륨</span>
                <span className="text-indigo-600">
                  총 {activeWorkoutVolume.toLocaleString()}kg
                </span>
              </div>
            </>
          )}

          <div className="space-y-2.5 rounded-[14px] border border-indigo-100 bg-[#faf9ff] p-3">
            <h3 className="text-xs font-bold text-slate-600">
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
                    className={`h-9 rounded-full border px-2 text-xs font-bold transition ${
                      active
                        ? "border-indigo-500 bg-white text-indigo-600 shadow-sm"
                        : "border-transparent bg-white/70 text-slate-500"
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
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] border border-indigo-200 bg-[#f7f5ff] text-[16px] font-black text-indigo-600 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.04)] transition-transform active:scale-[0.98]"
            >
              <PlusIcon className="size-4" />
              <span>{data.addActionLabel}</span>
            </button>
          ) : null}
          {errorMessage ? (
            <p className="rounded-[14px] bg-rose-50 px-3 py-2.5 text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}
          </div>
        </section>

        <section className="space-y-3.5">
          <div className="flex items-end justify-between gap-3 px-1">
            <h2 className="text-[15px] font-black leading-tight text-slate-950">
              오늘 완료한 운동
            </h2>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-indigo-600 shadow-sm">
              총 {totalCalories} kcal
            </span>
          </div>

          {displayedCompletedExercises.length > 0 ? (
            <div className="overflow-hidden rounded-[16px] border border-indigo-100/70 bg-white shadow-[0_8px_18px_rgba(37,45,100,0.08)]">
              {displayedCompletedExercises.map((exercise, index) => {
                const Icon =
                  exercise.icon === "cardio" ? BoltIcon : DumbbellIcon;

                return (
                  <article
                    key={`${exercise.title}-${exercise.time}-${index}`}
                    className="flex items-center gap-3 border-b border-indigo-50 p-3 last:border-b-0"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f3f0ff] text-indigo-700">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-black text-slate-950">
                        {exercise.title}
                      </h3>
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                        {exercise.summary}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        {exercise.time}
                      </span>
                      <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#4f46e5)] text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]">
                        <CheckCircleIcon className="size-4" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-indigo-200 bg-white px-4 py-6 text-center shadow-[0_8px_18px_rgba(37,45,100,0.06)]">
              <p className="text-[14px] font-black text-slate-800">
                아직 완료한 운동이 없습니다
              </p>
              <p className="mt-1.5 text-xs font-semibold text-slate-500">
                완료한 세트를 저장하면 여기에 쌓입니다.
              </p>
            </div>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-indigo-100/80 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_28px_rgba(79,70,229,0.10)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-2.5 flex items-center justify-between rounded-[14px] bg-[#faf9ff] px-3 py-2.5 text-[13px] font-bold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="size-4 text-indigo-500" />
              총 운동시간
            </span>
            <span className="text-indigo-600">
              {totalWorkoutTimeLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleFinishWorkout()}
            disabled={saving}
            className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#8b5cf6,#4f46e5)] text-[16px] font-black text-white shadow-[0_12px_22px_rgba(79,70,229,0.26)] transition-transform active:scale-[0.98] ${
              saving ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            <CheckCircleIcon className="size-5" />
            <span>{saving ? "운동 기록 저장 중" : data.finishActionLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
