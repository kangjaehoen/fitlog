"use client";

import { useState } from "react";
import { GripVerticalIcon, TrashIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import type { RoutineEditorData } from "../types";

type RoutineEditorScreenProps = {
  data: RoutineEditorData;
};

export function RoutineEditorScreen({ data }: RoutineEditorScreenProps) {
  const [name, setName] = useState(data.name);
  const [days, setDays] = useState(data.days);
  const [exercises, setExercises] = useState(data.exercises);
  const [savedLabel, setSavedLabel] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <StackHeader title="루틴 편집" fallbackHref="/fitness-routine" action="close" />

      <main className="mx-auto flex max-w-md flex-col gap-8 px-5 py-5">
        <section className="space-y-4">
          <div>
            <label className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              루틴 이름
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-bold text-slate-800 shadow-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 ml-1 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              목표 반복 주기
            </label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() =>
                    setDays((previous) =>
                      previous.map((item) =>
                        item.key === day.key
                          ? { ...item, active: !item.active }
                          : item,
                      ),
                    )
                  }
                  className={`aspect-square rounded-xl border text-xs font-bold transition ${
                    day.active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
              운동 목록 ({exercises.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                setExercises((previous) => [
                  ...previous,
                  {
                    name: "새 운동",
                    group: "전신",
                    sets: [{ weight: 0, reps: 12 }],
                  },
                ])
              }
              className="text-xs font-bold text-indigo-600"
            >
              + 운동 추가
            </button>
          </div>

          {exercises.map((exercise, index) => (
            <article
              key={`${exercise.name}-${index}`}
              className="space-y-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVerticalIcon className="size-4 text-slate-300" />
                  <div>
                    <input
                      value={exercise.name}
                      onChange={(event) =>
                        setExercises((previous) =>
                          previous.map((item, currentIndex) =>
                            currentIndex === index
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="text-base font-bold text-slate-800 outline-none"
                    />
                    <p className="text-[10px] font-bold uppercase text-indigo-500">
                      {exercise.group}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExercises((previous) =>
                      previous.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  className="text-slate-300 transition hover:text-rose-500"
                  aria-label={`${exercise.name} 삭제`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="grid grid-cols-3 gap-4 px-2 text-[10px] font-black uppercase text-slate-400">
                  <span>세트</span>
                  <span>무게(kg)</span>
                  <span>횟수</span>
                </div>
                <div className="mt-3 space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={`${exercise.name}-set-${setIndex}`}
                      className="grid grid-cols-3 gap-4 items-center"
                    >
                      <span className="px-2 text-xs font-bold text-slate-600">
                        {setIndex + 1}세트
                      </span>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(event) =>
                          setExercises((previous) =>
                            previous.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    sets: item.sets.map((currentSet, currentSetIndex) =>
                                      currentSetIndex === setIndex
                                        ? {
                                            ...currentSet,
                                            weight: Number(event.target.value || 0),
                                          }
                                        : currentSet,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-bold outline-none"
                      />
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(event) =>
                          setExercises((previous) =>
                            previous.map((item, currentIndex) =>
                              currentIndex === index
                                ? {
                                    ...item,
                                    sets: item.sets.map((currentSet, currentSetIndex) =>
                                      currentSetIndex === setIndex
                                        ? {
                                            ...currentSet,
                                            reps: Number(event.target.value || 0),
                                          }
                                        : currentSet,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-bold outline-none"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExercises((previous) =>
                      previous.map((item, currentIndex) =>
                        currentIndex === index
                          ? {
                              ...item,
                              sets: [...item.sets, { weight: 0, reps: 10 }],
                            }
                          : item,
                      ),
                    )
                  }
                  className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-200 py-2 text-[11px] font-bold text-slate-400 transition hover:bg-white"
                >
                  + 세트 추가
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <span className="text-lg text-amber-500">!</span>
          <p className="text-[11px] leading-5 text-amber-700">
            <span className="font-bold">AI 코칭 메모</span> {data.insight}
          </p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-5 py-5 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          {savedLabel ? (
            <p className="mb-3 text-center text-xs font-semibold text-emerald-600">
              {savedLabel}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              setSavedLabel(`"${name || "새 루틴"}" 루틴 구성이 저장되었어요.`)
            }
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98]"
          >
            {data.saveActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
