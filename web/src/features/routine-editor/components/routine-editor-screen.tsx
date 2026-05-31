"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  DumbbellIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import { saveRoutineEditor } from "../api";
import type { RoutineEditorData } from "../types";

type RoutineEditorScreenProps = {
  data: RoutineEditorData;
  createNew?: boolean;
};

type RoutineExercise = RoutineEditorData["exercises"][number];

const SAVE_ACTION_LABEL = "저장하기";

function createExercise(): RoutineExercise {
  return {
    name: "새 운동",
    group: "전신",
    sets: [{ weight: 0, reps: 12 }],
  };
}

function formatDaySummary(days: RoutineEditorData["days"]) {
  const activeDays = days.filter((day) => day.active).map((day) => day.label);

  return activeDays.length > 0 ? activeDays.join(", ") : "요일 미선택";
}

export function RoutineEditorScreen({
  createNew = false,
  data,
}: RoutineEditorScreenProps) {
  const [routineId, setRoutineId] = useState(data.id);
  const [name, setName] = useState(data.name);
  const [days, setDays] = useState(data.days);
  const [exercises, setExercises] = useState(data.exercises);
  const [shouldCreateNew, setShouldCreateNew] = useState(createNew);
  const [savedLabel, setSavedLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeDayCount = days.filter((day) => day.active).length;
  const totalSetCount = exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  );
  const routineLabel = name.trim() || (shouldCreateNew ? "새 루틴" : "이름 없는 루틴");
  const daySummary = formatDaySummary(days);

  const clearFeedback = () => {
    setSavedLabel("");
    setErrorMessage(null);
  };

  const updateExercise = (
    exerciseIndex: number,
    updater: (exercise: RoutineExercise) => RoutineExercise,
  ) => {
    setExercises((previous) =>
      previous.map((exercise, index) =>
        index === exerciseIndex ? updater(exercise) : exercise,
      ),
    );
    clearFeedback();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage("루틴 이름을 입력해주세요.");
      return;
    }

    if (exercises.length === 0) {
      setErrorMessage("운동을 1개 이상 추가해주세요.");
      return;
    }

    if (exercises.some((exercise) => !exercise.name.trim())) {
      setErrorMessage("운동 이름을 모두 입력해주세요.");
      return;
    }

    if (exercises.some((exercise) => exercise.sets.length === 0)) {
      setErrorMessage("각 운동은 세트를 1개 이상 포함해야 해요.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const savedRoutine = await saveRoutineEditor(
        {
          id: routineId,
          name,
          days,
          exercises,
        },
        getPersistedAuthToken(),
        shouldCreateNew,
      );

      setName(savedRoutine.name);
      setRoutineId(savedRoutine.id);
      setDays(savedRoutine.days);
      setExercises(savedRoutine.exercises);
      setShouldCreateNew(false);
      setSavedLabel(`"${savedRoutine.name || "새 루틴"}" 루틴 구성이 저장되었어요.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해주세요."
          : "루틴 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-[148px] text-slate-950">
      <StackHeader
        title={shouldCreateNew ? "루틴 만들기" : "루틴 편집"}
        fallbackHref="/fitness-routine"
        action="close"
      />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-4 px-4 pb-4 pt-3">
        <section className="relative overflow-hidden rounded-[16px] px-5 py-5 text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)] [background-image:radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.24),transparent_28%),linear-gradient(135deg,#8374f6_0%,#6651e8_48%,#5941d9_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="pointer-events-none absolute -right-5 top-5 grid size-[104px] rotate-[-14deg] place-items-center rounded-[24px] border border-white/15 bg-white/10 text-white/45 shadow-inner">
            <DumbbellIcon className="size-12" />
          </div>

          <div className="relative">
            <p className="text-[11px] font-black leading-none tracking-[0.22em] text-white/75">
              ROUTINE BUILDER
            </p>
            <h2 className="mt-2 max-w-[250px] truncate text-[22px] font-black leading-tight">
              {routineLabel}
            </h2>
            <p className="mt-2 max-w-[248px] text-[12px] font-semibold leading-5 text-white/80">
              반복 요일과 운동 세트를 한 화면에서 정리해요.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <RoutineMetric label="반복 요일" value={`${activeDayCount}일`} />
              <RoutineMetric label="운동 구성" value={`${exercises.length}개`} />
              <RoutineMetric label="총 세트" value={`${totalSetCount}개`} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-[16px] border border-[#edf0ff] bg-white p-4 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
          <div>
            <label className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-[0.2em] text-[#7a83a7]">
              루틴 이름
            </label>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFeedback();
              }}
              placeholder="루틴 이름을 입력하세요"
              className="h-[56px] w-full rounded-[14px] border border-[#e5e8fb] bg-[#fafaff] px-4 text-[15px] font-black text-[#11172f] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] outline-none transition placeholder:text-[#a0a7bd] focus:border-[#7563f1]/50 focus:bg-white focus:ring-4 focus:ring-[#7563f1]/10"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7a83a7]">
                목표 반복 주기
              </label>
              <span className="max-w-[145px] truncate text-right text-[11px] font-bold text-[#5b50f4]">
                {daySummary}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    setDays((previous) =>
                      previous.map((item) =>
                        item.key === day.key
                          ? { ...item, active: !item.active }
                          : item,
                      ),
                    );
                    clearFeedback();
                  }}
                  className={`aspect-square rounded-[13px] border text-[12px] font-black transition active:scale-95 ${
                    day.active
                      ? "border-[#695dff] bg-[linear-gradient(135deg,#7b61ff_0%,#5145e8_100%)] text-white shadow-[0_10px_18px_rgba(84,69,232,0.24)]"
                      : "border-[#edf0ff] bg-white text-[#687093] shadow-[0_6px_14px_rgba(37,45,100,0.04)]"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[11px] font-black leading-none tracking-[0.2em] text-[#7a83a7]">
                EXERCISES
              </p>
              <h2 className="mt-1 text-[15px] font-black leading-tight text-[#11172f]">
                운동 구성 ({exercises.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setExercises((previous) => [...previous, createExercise()]);
                clearFeedback();
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-3 text-xs font-black text-[#5b50f4] shadow-[0_8px_16px_rgba(79,70,229,0.08)] transition active:scale-[0.98]"
            >
              <PlusIcon className="size-4" />
              <span>운동 추가</span>
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-indigo-200 bg-white px-5 py-8 text-center shadow-[0_8px_18px_rgba(37,45,100,0.06)]">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f1efff] text-[#6653e9]">
                <SparklesIcon className="size-5" />
              </div>
              <p className="mt-4 text-[14px] font-black text-slate-800">
                아직 운동이 없어요.
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                자주 반복할 운동을 추가하고 세트 목표를 정해보세요.
              </p>
              <button
                type="button"
                onClick={() => {
                  setExercises((previous) => [...previous, createExercise()]);
                  clearFeedback();
                }}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#f1efff] px-5 text-[13px] font-black text-[#5b50f4] transition active:scale-[0.98]"
              >
                <PlusIcon className="size-4" />
                운동 추가
              </button>
            </div>
          ) : null}

          {exercises.map((exercise, index) => (
            <article
              key={`exercise-${index}`}
              className="overflow-hidden rounded-[16px] border border-[#edf0ff] bg-white shadow-[0_10px_28px_rgba(37,45,100,0.08)]"
            >
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[linear-gradient(135deg,#8b5cf6,#4f46e5)] text-white shadow-[0_10px_20px_rgba(79,70,229,0.20)]">
                    <DumbbellIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      value={exercise.name}
                      onChange={(event) =>
                        updateExercise(index, (item) => ({
                          ...item,
                          name: event.target.value,
                        }))
                      }
                      placeholder="운동 이름"
                      className="h-9 w-full rounded-[10px] border border-transparent bg-transparent px-0 text-[17px] font-black leading-tight text-[#11172f] outline-none transition placeholder:text-[#a0a7bd] focus:border-indigo-100 focus:bg-[#faf9ff] focus:px-3"
                    />
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#5b50f4]">
                        {exercise.sets.length}세트
                      </span>
                      <input
                        value={exercise.group}
                        onChange={(event) =>
                          updateExercise(index, (item) => ({
                            ...item,
                            group: event.target.value,
                          }))
                        }
                        aria-label={`${exercise.name || "운동"} 부위`}
                        className="h-7 min-w-0 flex-1 rounded-full bg-slate-50 px-2.5 text-[11px] font-bold text-[#7a83a7] outline-none transition focus:bg-indigo-50 focus:text-[#5b50f4]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExercises((previous) =>
                      previous.filter((_, currentIndex) => currentIndex !== index),
                    );
                    clearFeedback();
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500 transition active:scale-95"
                  aria-label={`${exercise.name || "운동"} 삭제`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>

              <div className="border-t border-[#edf0ff] bg-[#faf9ff] p-3">
                <div className="grid grid-cols-[42px_minmax(0,1fr)_minmax(0,1fr)_36px] gap-1.5 px-1 text-center text-[10px] font-black uppercase text-[#8a91aa]">
                  <span>세트</span>
                  <span>KG</span>
                  <span>횟수</span>
                  <span />
                </div>

                <div className="mt-2 space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={`exercise-${index}-set-${setIndex}`}
                      className="grid grid-cols-[42px_minmax(0,1fr)_minmax(0,1fr)_36px] items-center gap-1.5"
                    >
                      <span className="rounded-[10px] bg-white py-2 text-center text-xs font-black text-[#687093]">
                        {setIndex + 1}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={set.weight}
                        onChange={(event) =>
                          updateExercise(index, (item) => ({
                            ...item,
                            sets: item.sets.map((currentSet, currentSetIndex) =>
                              currentSetIndex === setIndex
                                ? {
                                    ...currentSet,
                                    weight: Number(event.target.value || 0),
                                  }
                                : currentSet,
                            ),
                          }))
                        }
                        aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 무게`}
                        className="h-10 min-w-0 rounded-[10px] border border-[#e5e8fb] bg-white text-center text-sm font-black text-[#11172f] outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-[#7563f1]/10"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={set.reps}
                        onChange={(event) =>
                          updateExercise(index, (item) => ({
                            ...item,
                            sets: item.sets.map((currentSet, currentSetIndex) =>
                              currentSetIndex === setIndex
                                ? {
                                    ...currentSet,
                                    reps: Number(event.target.value || 0),
                                  }
                                : currentSet,
                            ),
                          }))
                        }
                        aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 횟수`}
                        className="h-10 min-w-0 rounded-[10px] border border-[#e5e8fb] bg-white text-center text-sm font-black text-[#11172f] outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-[#7563f1]/10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(index, (item) => ({
                            ...item,
                            sets: item.sets.filter(
                              (_, currentSetIndex) => currentSetIndex !== setIndex,
                            ),
                          }))
                        }
                        disabled={exercise.sets.length <= 1}
                        className="grid h-10 place-items-center rounded-[10px] bg-white text-slate-300 transition active:scale-95 enabled:hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`${exercise.name || "운동"} ${setIndex + 1}세트 삭제`}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateExercise(index, (item) => {
                      const previousSet = item.sets[item.sets.length - 1];

                      return {
                        ...item,
                        sets: [
                          ...item.sets,
                          {
                            weight: previousSet?.weight ?? 0,
                            reps: previousSet?.reps ?? 10,
                          },
                        ],
                      };
                    })
                  }
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-indigo-200 bg-white text-[13px] font-black text-[#5b50f4] transition active:scale-[0.99]"
                >
                  <PlusIcon className="size-4" />
                  <span>세트 추가</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e8f5] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_28px_rgba(79,70,229,0.10)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-2.5 flex items-center justify-between gap-3 rounded-[14px] bg-[#faf9ff] px-3 py-2.5 text-[12px] font-bold text-[#5c668b]">
            <span className="min-w-0 truncate">{routineLabel}</span>
            <span className="max-w-[190px] shrink-0 truncate text-right text-[#5b50f4]">
              {daySummary} · {exercises.length}개 운동
            </span>
          </div>

          <div aria-live="polite">
            {savedLabel ? (
              <p className="mb-2.5 rounded-[12px] bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-600">
                {savedLabel}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mb-2.5 rounded-[12px] bg-rose-50 px-3 py-2 text-center text-xs font-bold text-rose-500">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#7b61ff_0%,#5145e8_100%)] text-[16px] font-black text-white shadow-[0_14px_22px_rgba(84,69,232,0.26)] transition-transform active:scale-[0.98] ${
              saving ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            <CheckCircleIcon className="size-5" />
            <span>{saving ? "저장 중" : SAVE_ACTION_LABEL}</span>
          </button>
        </div>
      </div>
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
