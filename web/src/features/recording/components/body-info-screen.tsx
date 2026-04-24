"use client";

import { useMemo, useState } from "react";
import { StackHeader } from "@/components/navigation/stack-header";
import type { BodyInfoDraft, BodyMetricKey } from "../types";

type BodyInfoScreenProps = {
  draft: BodyInfoDraft;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function BodyInfoScreen({ draft }: BodyInfoScreenProps) {
  const [currentKey, setCurrentKey] = useState<BodyMetricKey>(
    draft.metrics[0]?.key ?? "weight",
  );
  const [values, setValues] = useState<Record<BodyMetricKey, number>>({
    weight: draft.metrics.find((metric) => metric.key === "weight")?.value ?? 0,
    muscle:
      draft.metrics.find((metric) => metric.key === "muscle")?.value ?? 0,
    fat: draft.metrics.find((metric) => metric.key === "fat")?.value ?? 0,
  });
  const [savedLabel, setSavedLabel] = useState("");

  const metric = useMemo(
    () => draft.metrics.find((item) => item.key === currentKey) ?? draft.metrics[0],
    [currentKey, draft.metrics],
  );

  if (!metric) {
    return null;
  }

  const currentValue = values[currentKey];

  const handleValueChange = (nextValue: number) => {
    setValues((previous) => ({
      ...previous,
      [currentKey]: clamp(nextValue, metric.min, metric.max),
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <StackHeader title="기록하기" fallbackHref="/mypage" action="close" />

      <main className="mx-auto flex max-w-md flex-col gap-10 px-5 pt-4 pb-28">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {draft.dateLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-1">
          {draft.metrics.map((item) => {
            const active = item.key === currentKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCurrentKey(item.key)}
                className={`rounded-xl px-3 py-3.5 text-xs font-black transition ${
                  active
                    ? "bg-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                style={active ? { color: item.color } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="flex flex-col items-center gap-16 py-8">
          <div className="text-center">
            <div className="flex items-end justify-center gap-2">
              <input
                type="number"
                step={metric.step}
                min={metric.min}
                max={metric.max}
                value={currentValue}
                onChange={(event) =>
                  handleValueChange(Number(event.target.value || metric.min))
                }
                className="w-44 bg-transparent text-center text-7xl font-black outline-none"
                style={{ color: metric.color }}
              />
              <span className="pb-3 text-2xl font-bold text-slate-300">
                {metric.unit}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              {metric.helper}
            </p>
          </div>

          <div className="w-full px-4">
            <input
              type="range"
              min={metric.min}
              max={metric.max}
              step={metric.step}
              value={currentValue}
              onChange={(event) => handleValueChange(Number(event.target.value))}
              className="w-full"
              style={{ accentColor: metric.color }}
            />
            <div className="mt-4 flex justify-between px-1 text-xs font-bold text-slate-300">
              <span>{metric.min.toFixed(1)}</span>
              <span>{metric.max.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3">
            {draft.metrics.map((item) => {
              const active = item.key === currentKey;

              return (
                <article
                  key={item.key}
                  className={`rounded-2xl border p-4 text-center transition ${
                    active
                      ? "border-transparent text-white shadow-xl"
                      : "border-slate-100 bg-white text-slate-400"
                  }`}
                  style={active ? { backgroundColor: item.color } : undefined}
                >
                  <p className="text-[11px] font-bold">{item.label}</p>
                  <p
                    className={`mt-2 text-lg font-black ${
                      active ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {values[item.key].toFixed(1)}
                    <span className="ml-1 text-[11px] font-semibold">
                      {item.unit}
                    </span>
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          {savedLabel ? (
            <p className="text-center text-xs font-semibold text-emerald-600">
              {savedLabel}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              setSavedLabel(
                `${metric.label} ${currentValue.toFixed(1)}${metric.unit} 기록을 저장했어요.`,
              )
            }
            className="w-full rounded-2xl py-4 text-base font-bold text-white shadow-xl transition-transform active:scale-[0.98]"
            style={{ backgroundColor: metric.color }}
          >
            {draft.primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
