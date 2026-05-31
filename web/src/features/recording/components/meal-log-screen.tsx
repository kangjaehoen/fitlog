"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRightIcon,
  CupcakeIcon,
  MinusIcon,
  MoonIcon,
  NoonIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
} from "@/components/icons";
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

const MEAL_ICON_BY_LABEL = {
  아침: SunIcon,
  점심: NoonIcon,
  저녁: MoonIcon,
  간식: CupcakeIcon,
};

function mealIconFor(label: string) {
  return MEAL_ICON_BY_LABEL[label as keyof typeof MEAL_ICON_BY_LABEL] ?? SunIcon;
}

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
    <div className="min-h-screen bg-[#f8f8ff] pb-[148px]">
      <StackHeader title="식단 기록" fallbackHref="/" />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-5 px-4 pb-4 pt-3">
        <section className="space-y-5 rounded-[28px] border border-[#edf0ff] bg-white p-4 shadow-[0_14px_34px_rgba(37,45,100,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black leading-none tracking-[0.2em] text-[#5d53f4]">
                QUICK ADD
              </p>
              <h2 className="mt-3 text-xl font-black leading-none text-[#11172f]">
                오늘 식사 기록 추가
              </h2>
            </div>
            <div className="shrink-0 rounded-full border border-[#e7e9f8] bg-[#f7f7ff] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold leading-none text-[#525872]">
                  치팅밀
                </span>
                <ToggleSwitch
                  checked={cheating}
                  onToggle={() => setCheating((previous) => !previous)}
                  tone="indigo"
                  label="치팅밀 토글"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {data.mealTypes.map((item) => {
              const active = item === mealType;
              const Icon = mealIconFor(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMealType(item)}
                  className={`flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-[18px] border text-[13px] font-black leading-none transition active:scale-[0.98] ${
                    active
                      ? "border-[#695dff] bg-[linear-gradient(135deg,#ffffff_0%,#f7f4ff_100%)] text-[#5b50f4] shadow-[0_12px_24px_rgba(96,72,220,0.16)]"
                      : "border-[#edf0ff] bg-white text-[#151a31] shadow-[0_8px_18px_rgba(37,45,100,0.05)]"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${
                      active ? "text-[#5b50f4]" : "text-[#756ee7]"
                    }`}
                  />
                  {item}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#e5e8fb] bg-white shadow-[0_8px_18px_rgba(37,45,100,0.04)]">
            <div className="relative border-b border-[#edf0ff]">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6f79a9]" />
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
                className="h-[64px] w-full bg-transparent py-0 pl-12 pr-4 text-[15px] font-semibold text-[#11172f] outline-none transition placeholder:text-[#9299b2] focus:bg-[#fafaff]"
              />
            </div>

            {suggestionsOpen && suggestions.length > 0 ? (
              <div className="border-b border-[#edf0ff] bg-white">
                <ul className="max-h-56 overflow-auto py-1">
                  {suggestions.map((item) => {
                    const category = [item.foodCat1Nm, item.foodCat2Nm]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={item.foodCd}>
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#f8f8ff]"
                          onClick={() => {
                            setSelectedRef(item);
                            setFoodName(item.foodNameKr);
                            setSuggestionsOpen(false);
                          }}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#171a33]">
                              {item.foodNameKr}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-[#8a91aa]">
                              {category || item.servingSize}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[11px] font-black text-[#5b50f4]">
                              {item.energyKcal != null
                                ? `${Math.round(item.energyKcal).toLocaleString()} kcal`
                                : "—"}
                            </p>
                            <p className="mt-0.5 text-[10px] font-bold text-[#a2a8bd]">
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
                <div className="border-t border-[#edf0ff] px-4 py-2">
                  <button
                    type="button"
                    className="text-[11px] font-bold text-[#8a91aa] hover:text-[#525872]"
                    onClick={() => setSuggestionsOpen(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-5 pt-[18px]">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-[12px] font-bold leading-snug text-[#687093]">
                  {selectedRef ? (
                    <>
                      {selectedRef.servingSize}
                      {selectedRef.nutrientBaselineG
                        ? ` · 기준 ${Math.round(selectedRef.nutrientBaselineG)}g`
                        : ""}
                    </>
                  ) : searching ? (
                    "검색 중..."
                  ) : (
                    "연관검색에서 선택하면 더 정확해져요."
                  )}
                </p>
                <p className="shrink-0 text-[12px] font-black leading-none text-[#11172f]">
                  예상 {estimatedDraftCalories.toLocaleString()} kcal
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-[15px] border border-[#edf0ff] bg-white p-1 shadow-[0_6px_14px_rgba(37,45,100,0.04)]">
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
                        className={`h-9 rounded-[12px] px-3.5 text-[12px] font-black leading-none transition ${
                          active
                            ? "bg-[#f0ecff] text-[#5b50f4]"
                            : "text-[#687093]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
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
                        className="h-10 w-20 rounded-[14px] border border-[#edf0ff] bg-white px-3 text-right text-sm font-black text-[#11172f] outline-none transition focus:ring-2 focus:ring-[#7563f1]/20"
                        aria-label="그램 입력"
                      />
                      <span className="text-[12px] font-bold text-[#687093]">g</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setServingQuantity((previous) => Math.max(previous - 1, 1))
                        }
                        className="flex size-10 items-center justify-center rounded-full border border-[#edf0ff] bg-white text-[#5b6386] shadow-[0_8px_18px_rgba(37,45,100,0.06)] transition active:scale-95"
                        aria-label="인분 줄이기"
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="min-w-9 text-center text-xl font-black leading-none text-[#11172f]">
                        {servingQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setServingQuantity((previous) => previous + 1)}
                        className="flex size-10 items-center justify-center rounded-full border border-[#edf0ff] bg-white text-[#5b6386] shadow-[0_8px_18px_rgba(37,45,100,0.06)] transition active:scale-95"
                        aria-label="인분 늘리기"
                      >
                        <PlusIcon className="size-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddRecord}
            disabled={saving}
            className="h-[52px] w-full rounded-[16px] bg-[linear-gradient(135deg,#7b61ff_0%,#5145e8_100%)] text-[16px] font-black text-white shadow-[0_14px_22px_rgba(84,69,232,0.26)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {data.primaryActionLabel}
          </button>
          {errorMessage ? (
            <p className="text-center text-xs font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[14px] font-black leading-none text-[#11172f]">
              오늘의 식단 리스트
            </h2>
            <span className="text-[12px] font-bold leading-none text-[#7380ad]">
              총 {totalCalories.toLocaleString()} kcal 섭취
            </span>
          </div>

          <div className="space-y-3">
            {records.map((record, index) => {
              const RecordIcon = mealIconFor(record.mealType);

              return (
                <article
                  key={`${record.title}-${record.time}-${index}`}
                  className={`relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-[16px] border bg-white p-3 shadow-[0_8px_18px_rgba(37,45,100,0.08)] ${
                    record.cheating
                      ? "border-amber-100"
                      : "border-[#edf0ff]"
                  }`}
                >
                  {record.cheating ? (
                    <span className="absolute right-0 top-0 rounded-bl-lg bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white">
                      CHEATING
                    </span>
                  ) : null}
                  <div
                    className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-[14px] text-[10px] font-black leading-tight ${
                      record.cheating
                        ? "bg-amber-50 text-amber-600"
                        : "bg-[#f0ecff] text-[#5b50f4]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      <RecordIcon className="size-3" />
                      {record.mealType}
                    </span>
                    <span className="mt-0.5 opacity-70">{record.time}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-black leading-tight text-[#11172f]">
                      {record.title}
                    </h3>
                    <p
                      className={`mt-0.5 text-[12px] font-semibold ${
                        record.cheating ? "text-amber-600" : "text-[#7a83a7]"
                      }`}
                    >
                      {record.amount} · {record.calories.toLocaleString()} kcal
                    </p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-[#897cff]" />
                </article>
              );
            })}

            <div className="flex min-h-11 items-center justify-center gap-2 rounded-[15px] border border-dashed border-[#cbd1ea] bg-white/40 px-4 text-[13px] font-bold text-[#7380ad]">
              <PlusIcon className="size-3.5" />
              <span>다음 식사도 계속 기록해 보세요.</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#e6e8f5] bg-white/95 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-3 flex items-center justify-between px-1 text-[13px] font-black leading-none text-[#5c668b]">
            <span>오늘 목표 {data.goalCalories.toLocaleString()} kcal</span>
            <span className="text-[#5b50f4]">
              남은 칼로리 {remainingCalories.toLocaleString()} kcal
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleFinishMealLog()}
            disabled={saving}
            className={`h-[52px] w-full rounded-[16px] bg-[linear-gradient(135deg,#20185f_0%,#4730bd_100%)] text-[16px] font-black text-white shadow-[0_12px_22px_rgba(32,24,95,0.24)] transition-transform active:scale-[0.98] ${
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
