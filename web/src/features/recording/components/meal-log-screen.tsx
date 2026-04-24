"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { MealLogData } from "../types";

type MealLogScreenProps = {
  data: MealLogData;
};

type UnitKey = MealLogData["unitOptions"][number]["key"];

export function MealLogScreen({ data }: MealLogScreenProps) {
  const [mealType, setMealType] = useState(data.mealTypes[0]);
  const [cheating, setCheating] = useState(false);
  const [unit, setUnit] = useState<UnitKey>(data.unitOptions[0]?.key ?? "serving");
  const [quantity, setQuantity] = useState(data.defaultServingAmount);
  const [foodName, setFoodName] = useState(data.defaultFoodName);
  const [records, setRecords] = useState(data.records);

  const totalCalories = useMemo(
    () => records.reduce((sum, record) => sum + record.calories, 0),
    [records],
  );
  const remainingCalories = Math.max(data.goalCalories - totalCalories, 0);

  const handleAddRecord = () => {
    const normalizedName = foodName.trim() || data.defaultFoodName;
    const estimatedCalories =
      unit === "serving"
        ? data.estimatedCaloriesPerServing * quantity
        : Math.round(quantity * 1.7);

    setRecords((previous) => [
      ...previous,
      {
        mealType,
        time: "지금",
        title: normalizedName,
        amount:
          unit === "serving" ? `${quantity}회분` : `${Math.round(quantity)}g`,
        calories: estimatedCalories,
        cheating,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36">
      <StackHeader title="식단 기록" fallbackHref="/" />

      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-4">
        <section className="space-y-4 rounded-[28px] border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                Quick Add
              </p>
              <h2 className="mt-2 text-lg font-black text-slate-900">
                오늘 식사 기록 추가
              </h2>
            </div>
            <div className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-700">
                  치팅밀
                </span>
                <ToggleSwitch
                  checked={cheating}
                  onToggle={() => setCheating((previous) => !previous)}
                  tone="amber"
                  label="치팅밀 토글"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {data.mealTypes.map((item) => {
              const active = item === mealType;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMealType(item)}
                  className={`rounded-xl py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "border border-slate-100 bg-white text-slate-500"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-100">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={foodName}
                onChange={(event) => setFoodName(event.target.value)}
                placeholder={data.searchPlaceholder}
                className="w-full rounded-xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-100">
                {data.unitOptions.map((option) => {
                  const active = option.key === unit;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setUnit(option.key)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                        active
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((previous) => Math.max(previous - 1, 1))}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 ring-1 ring-slate-100"
                >
                  -
                </button>
                <span className="min-w-10 text-center text-lg font-black text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((previous) => previous + 1)}
                  className="flex size-8 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 ring-1 ring-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRecord}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98]"
          >
            {data.primaryActionLabel}
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800">오늘의 식단 리스트</h2>
            <span className="text-[11px] font-medium text-slate-400">
              총 {totalCalories.toLocaleString()} kcal 섭취
            </span>
          </div>

          <div className="space-y-3">
            {records.map((record, index) => (
              <article
                key={`${record.title}-${record.time}-${index}`}
                className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ${
                  record.cheating
                    ? "border-amber-100"
                    : "border-slate-100"
                }`}
              >
                {record.cheating ? (
                  <span className="absolute top-0 right-0 rounded-bl-lg bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    CHEATING
                  </span>
                ) : null}
                <div
                  className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-[10px] font-bold ${
                    record.cheating
                      ? "bg-amber-50 text-amber-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <span>{record.mealType}</span>
                  <span className="opacity-70">{record.time}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-slate-800">
                    {record.title}
                  </h3>
                  <p
                    className={`text-[11px] ${
                      record.cheating ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {record.amount} · {record.calories.toLocaleString()} kcal
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-300">›</div>
              </article>
            ))}

            <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-xs font-bold text-slate-400">
              <span>+</span>
              <span>다음 식사도 계속 기록해 보세요.</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold text-slate-500">
            <span>오늘 목표 {data.goalCalories.toLocaleString()} kcal</span>
            <span className="text-indigo-600">
              남은 칼로리 {remainingCalories.toLocaleString()} kcal
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
