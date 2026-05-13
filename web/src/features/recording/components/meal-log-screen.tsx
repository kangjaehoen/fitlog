"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { StackHeader } from "@/components/navigation/stack-header";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import { recordMeal, type MealRecordPayload } from "../api";
import {
  searchFoodNutrientRefs,
  type FoodNutrientRefSearchItem,
} from "../food-nutrient-refs-api";
import type { MealLogData } from "../types";

type MealLogScreenProps = {
  data: MealLogData;
};

type UnitKey = MealLogData["unitOptions"][number]["key"];
type MealRecordDraft = MealLogData["records"][number] & {
  persistable: boolean;
  payload?: MealRecordPayload;
};
type PersistableMealRecordDraft = MealRecordDraft & {
  persistable: true;
  payload: MealRecordPayload;
};

const MEAL_TYPE_BY_LABEL: Record<string, MealRecordPayload["mealType"]> = {
  아침: "BREAKFAST",
  점심: "LUNCH",
  저녁: "DINNER",
  간식: "SNACK",
};

export function MealLogScreen({ data }: MealLogScreenProps) {
  const router = useRouter();
  const [mealType, setMealType] = useState(data.mealTypes[0]);
  const [cheating, setCheating] = useState(false);
  const [unit, setUnit] = useState<UnitKey>(data.unitOptions[0]?.key ?? "serving");
  const [servingQuantity, setServingQuantity] = useState(data.defaultServingAmount);
  const [gramInput, setGramInput] = useState(() =>
    String(Math.max(1, Math.round(data.defaultServingAmount))),
  );
  const [foodName, setFoodName] = useState(data.defaultFoodName);
  const [selectedRef, setSelectedRef] = useState<FoodNutrientRefSearchItem | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<FoodNutrientRefSearchItem[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const latestSearchId = useRef(0);
  const [records, setRecords] = useState<MealRecordDraft[]>(() =>
    data.records.map((record) => ({
      ...record,
      persistable: false,
    })),
  );
  const [lastAddedDraftKey, setLastAddedDraftKey] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalCalories = useMemo(
    () => records.reduce((sum, record) => sum + record.calories, 0),
    [records],
  );
  const remainingCalories = Math.max(data.goalCalories - totalCalories, 0);

  const quantity = useMemo(() => {
    if (unit === "gram") {
      const parsed = Number.parseFloat(gramInput);
      if (!Number.isFinite(parsed)) {
        return 0.01;
      }
      return Math.max(parsed, 0.01);
    }
    return servingQuantity;
  }, [gramInput, servingQuantity, unit]);

  const estimatedDraftCalories = useMemo(() => {
    const nameOk = foodName.trim().length > 0;
    if (!nameOk) {
      return 0;
    }

    if (!selectedRef || !selectedRef.energyKcal || !selectedRef.nutrientBaselineG) {
      const fallback =
        unit === "serving"
          ? data.estimatedCaloriesPerServing * quantity
          : Math.round(quantity * 1.7);
      return Math.max(0, fallback);
    }

    const baselineG = Number(selectedRef.nutrientBaselineG);
    if (!Number.isFinite(baselineG) || baselineG <= 0) {
      return 0;
    }

    const kcalPerG = Number(selectedRef.energyKcal) / baselineG;
    const grams = unit === "gram" ? quantity : quantity * baselineG;
    const calories = Math.round(kcalPerG * grams);
    return Math.max(0, calories);
  }, [
    data.estimatedCaloriesPerServing,
    foodName,
    quantity,
    selectedRef,
    unit,
  ]);

  const currentDraftKey = () =>
    JSON.stringify({
      cheating,
      foodName: foodName.trim(),
      mealType,
      quantity,
      unit,
    });

  const buildCurrentMealRecord = (): PersistableMealRecordDraft | null => {
    const normalizedName = foodName.trim();
    if (!normalizedName) {
      return null;
    }

    const calories = estimatedDraftCalories;
    const quantityUnit = unit === "serving" ? "SERVING" : "GRAM";
    const normalizedFoodCd = selectedRef ? selectedRef.foodCd : null;

    return {
      mealType,
      time: "지금",
      title: normalizedName,
      amount: unit === "serving" ? `${quantity}인분` : `${Math.round(quantity)}g`,
      calories,
      cheating,
      persistable: true,
      payload: {
        mealType: MEAL_TYPE_BY_LABEL[mealType] ?? "SNACK",
        foodName: normalizedName,
        foodCd: normalizedFoodCd,
        quantity,
        quantityUnit,
        caloriesKcal: calories,
      },
    };
  };

  useEffect(() => {
    const query = foodName.trim();
    if (!query) {
      queueMicrotask(() => {
        setSuggestions([]);
        setSuggestionsOpen(false);
        setSearching(false);
        setSelectedRef(null);
      });
      return;
    }

    if (selectedRef && selectedRef.foodNameKr === query) {
      queueMicrotask(() => {
        setSuggestions([]);
        setSuggestionsOpen(false);
        setSearching(false);
      });
      return;
    }

    if (selectedRef && selectedRef.foodNameKr !== query) {
      queueMicrotask(() => setSelectedRef(null));
    }

    const searchId = ++latestSearchId.current;
    queueMicrotask(() => setSearching(true));

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const results = await searchFoodNutrientRefs(query, 8);
          if (latestSearchId.current !== searchId) {
            return;
          }
          setSuggestions(results);
          setSuggestionsOpen(true);
        } catch {
          if (latestSearchId.current !== searchId) {
            return;
          }
          setSuggestions([]);
          setSuggestionsOpen(false);
        } finally {
          if (latestSearchId.current === searchId) {
            setSearching(false);
          }
        }
      })();
    }, 250);

    return () => {
      window.clearTimeout(handle);
    };
  }, [foodName, selectedRef]);

  const handleAddRecord = () => {
    const record = buildCurrentMealRecord();
    if (!record) {
      setErrorMessage("음식 이름을 입력해주세요.");
      return;
    }

    setRecords((previous) => [...previous, record]);
    setLastAddedDraftKey(currentDraftKey());
    setErrorMessage(null);
  };

  const handleFinishMealLog = async () => {
    const currentRecord = buildCurrentMealRecord();
    const persistableRecords = records.filter(
      (record): record is PersistableMealRecordDraft =>
        record.persistable && Boolean(record.payload),
    );
    const recordsToPersist =
      currentRecord && currentDraftKey() !== lastAddedDraftKey
        ? [...persistableRecords, currentRecord]
        : persistableRecords;

    if (recordsToPersist.length === 0) {
      setErrorMessage("저장할 식단 기록이 없습니다. 식단을 추가한 뒤 다시 시도해주세요.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const token = getPersistedAuthToken();
      for (const record of recordsToPersist) {
        await recordMeal(record.payload, token);
      }

      router.replace("/main");
    } catch (error) {
      setSaving(false);
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해주세요."
          : "식단 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
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
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setSuggestionsOpen(true);
                  }
                }}
                placeholder={data.searchPlaceholder}
                className="w-full rounded-xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[11px] font-bold text-slate-400">
                {selectedRef ? (
                  <>
                    {selectedRef.servingSize}
                    {selectedRef.nutrientBaselineG
                      ? ` · 기준 ${Math.round(selectedRef.nutrientBaselineG)}g`
                      : ""}
                  </>
                ) : searching ? (
                  "검색 중…"
                ) : (
                  "연관검색에서 선택하면 더 정확해져요."
                )}
              </p>
              <p className="text-[11px] font-black text-slate-700">
                예상 {estimatedDraftCalories.toLocaleString()} kcal
              </p>
            </div>

            {suggestionsOpen && suggestions.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <ul className="max-h-56 overflow-auto py-1">
                  {suggestions.map((item) => {
                    const category = [item.foodCat1Nm, item.foodCat2Nm]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={item.foodCd}>
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                          onClick={() => {
                            setSelectedRef(item);
                            setFoodName(item.foodNameKr);
                            setSuggestionsOpen(false);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {item.foodNameKr}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                              {category || item.servingSize}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[11px] font-black text-indigo-600">
                              {item.energyKcal != null
                                ? `${Math.round(item.energyKcal).toLocaleString()} kcal`
                                : "—"}
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                              {item.nutrientBaselineG != null
                                ? `기준 ${Math.round(item.nutrientBaselineG)}g`
                                : ""}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-slate-100 px-4 py-2">
                  <button
                    type="button"
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                    onClick={() => setSuggestionsOpen(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-100">
                {data.unitOptions.map((option) => {
                  const active = option.key === unit;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setUnit(option.key);
                        if (option.key === "gram") {
                          setGramInput(String(Math.max(1, Math.round(servingQuantity))));
                        }
                      }}
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
                {unit === "gram" ? (
                  <div className="flex items-center gap-2">
                    <input
                      inputMode="decimal"
                      type="number"
                      min={0.01}
                      step={1}
                      value={gramInput}
                      onChange={(event) => setGramInput(event.target.value)}
                      onBlur={() => {
                        const parsed = Number.parseFloat(gramInput);
                        if (!Number.isFinite(parsed)) {
                          setGramInput(String(Math.max(1, Math.round(servingQuantity))));
                          return;
                        }
                        const normalized = Math.max(parsed, 0.01);
                        setGramInput(String(normalized));
                      }}
                      className="w-24 rounded-xl border border-slate-100 bg-white px-3 py-2 text-right text-sm font-black text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-500/20"
                      aria-label="그램 입력"
                    />
                    <span className="text-[11px] font-bold text-slate-400">g</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setServingQuantity((previous) => Math.max(previous - 1, 1))
                      }
                      className="flex size-8 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 ring-1 ring-slate-100"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-lg font-black text-slate-800">
                      {servingQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServingQuantity((previous) => previous + 1)}
                      className="flex size-8 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-600 ring-1 ring-slate-100"
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRecord}
            disabled={saving}
            className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 transition-transform active:scale-[0.98]"
          >
            {data.primaryActionLabel}
          </button>
          {errorMessage ? (
            <p className="text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}
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
            onClick={() => void handleFinishMealLog()}
            disabled={saving}
            className={`w-full rounded-2xl bg-slate-800 py-4 text-base font-bold text-white transition-transform active:scale-[0.98] ${
              saving ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {saving ? "식단 기록 저장 중" : data.finishActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
