"use client";

import type { CSSProperties, SVGProps } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, DumbbellIcon, XIcon } from "@/components/icons";
import { getPersistedAuthToken } from "@/features/account/auth-session";
import { recordBodyMetric } from "../api";
import type { BodyInfoDraft, BodyMetricKey } from "../types";

type BodyInfoScreenProps = {
  draft: BodyInfoDraft;
};

type MetricTone = {
  accent: string;
  soft: string;
  gradient: string;
  shadow: string;
};

type MetricRangeStyle = CSSProperties & {
  "--metric-color": string;
  "--metric-range-progress": string;
};

const metricTones: Record<BodyMetricKey, MetricTone> = {
  weight: {
    accent: "#6351ea",
    soft: "#f0edff",
    gradient: "linear-gradient(135deg, #8374f6 0%, #6651e8 54%, #5941d9 100%)",
    shadow: "0 14px 28px rgba(96,72,220,0.24)",
  },
  muscle: {
    accent: "#13a471",
    soft: "#ecfdf5",
    gradient: "linear-gradient(135deg, #46d99f 0%, #13a471 100%)",
    shadow: "0 14px 28px rgba(19,164,113,0.20)",
  },
  fat: {
    accent: "#e15b7b",
    soft: "#fff1f4",
    gradient: "linear-gradient(135deg, #fb8aa2 0%, #e15b7b 100%)",
    shadow: "0 14px 28px rgba(225,91,123,0.20)",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function stepPrecision(step: number) {
  const fraction = step.toString().split(".")[1];
  return fraction?.length ?? 0;
}

function normalizeMetricValue(
  value: number,
  metric: BodyInfoDraft["metrics"][number],
) {
  return Number(
    clamp(value, metric.min, metric.max).toFixed(stepPrecision(metric.step)),
  );
}

function formatMetricValue(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function rangeProgress(value: number, min: number, max: number) {
  if (max <= min) {
    return 0;
  }

  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

function ScaleIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6.6 10.1c0-2.4 1.9-4.3 4.3-4.3h2.2c2.4 0 4.3 1.9 4.3 4.3v5.7c0 2.1-1.7 3.7-3.7 3.7H10.3c-2.1 0-3.7-1.7-3.7-3.7v-5.7Z"
        fill="currentColor"
      />
      <path
        d="M9.5 9.9c.7-.8 1.5-1.2 2.5-1.2s1.8.4 2.5 1.2"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.9"
        opacity="0.95"
      />
      <path
        d="M12 8.9v2.1"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.9"
        opacity="0.95"
      />
    </svg>
  );
}

function PercentIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.4"
      className={className}
    >
      <path d="m6.8 17.2 10.4-10.4" />
      <circle cx="8.2" cy="8.2" r="1.8" />
      <circle cx="15.8" cy="15.8" r="1.8" />
    </svg>
  );
}

function MetricIcon({
  metricKey,
  className,
}: {
  metricKey: BodyMetricKey;
  className: string;
}) {
  if (metricKey === "muscle") {
    return <DumbbellIcon className={className} />;
  }

  if (metricKey === "fat") {
    return <PercentIcon className={className} />;
  }

  return <ScaleIcon className={className} />;
}

export function BodyInfoScreen({ draft }: BodyInfoScreenProps) {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const metric = useMemo(
    () =>
      draft.metrics.find((item) => item.key === currentKey) ?? draft.metrics[0],
    [currentKey, draft.metrics],
  );

  if (!metric) {
    return null;
  }

  const tone = metricTones[currentKey];
  const currentValue = values[currentKey];
  const progress = rangeProgress(currentValue, metric.min, metric.max);
  const rangeStyle: MetricRangeStyle = {
    color: tone.accent,
    "--metric-color": tone.accent,
    "--metric-range-progress": `${progress}%`,
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/mypage");
  };

  const handleValueChange = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      return;
    }

    setValues((previous) => ({
      ...previous,
      [currentKey]: normalizeMetricValue(nextValue, metric),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);

    try {
      await recordBodyMetric(
        {
          weightKg: values.weight,
          skeletalMuscleKg: values.muscle,
          bodyFatPercent: values.fat,
        },
        getPersistedAuthToken(),
      );
      setSavedLabel(
        `${metric.label} ${formatMetricValue(currentValue)}${metric.unit} 기록을 저장했어요.`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message === "AUTH_REQUIRED"
          ? "로그인이 필요합니다. 다시 로그인한 뒤 저장해주세요."
          : "신체 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-[148px] text-[#1d2138]">
      <header className="sticky top-0 z-20 bg-[#f8f8ff]/95 backdrop-blur-[20px]">
        <div className="relative mx-auto flex h-[56px] w-full max-w-[390px] items-center justify-center px-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="absolute left-4 grid size-8 place-items-center rounded-full bg-white text-[#6351ea] shadow-[0_8px_18px_rgba(99,81,234,0.12)] ring-1 ring-[#ece8ff] transition active:scale-95"
          >
            <XIcon className="size-[17px]" />
          </button>
          <h1 className="text-[17px] font-black leading-none">
            신체 기록하기
          </h1>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100svh_-_56px_-_112px)] w-full max-w-[390px] flex-col gap-5 px-4 pb-4 pt-3">
        <section
          className="relative min-h-[164px] overflow-hidden rounded-[16px] px-5 py-5 text-white shadow-[0_14px_28px_rgba(96,72,220,0.26)]"
          style={{ backgroundImage: tone.gradient }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,transparent_42%)]" />
          <div className="absolute -right-3 top-3 size-24 rounded-[20px] border border-white/15 bg-white/10 text-white/45 shadow-inner" />
          <div className="absolute right-5 top-9 grid size-16 place-items-center rounded-[20px] bg-white/16 text-white">
            <MetricIcon metricKey={currentKey} className="size-9" />
          </div>

          <div className="relative flex items-center gap-2 text-[13px] font-bold text-white/95">
            <CalendarIcon className="size-3.5" />
            <span>{draft.dateLabel}</span>
          </div>
          <div className="relative mt-5 max-w-[230px]">
            <p className="text-[12px] font-bold text-white/80">
              오늘 입력할 지표
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-[42px] font-black leading-none">
                {formatMetricValue(currentValue)}
              </p>
              <span className="pb-1.5 text-[15px] font-black text-white/82">
                {metric.unit}
              </span>
            </div>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-white/80">
              {metric.helper}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2.5 rounded-[20px] border border-[#edf0ff] bg-white p-1.5 shadow-[0_10px_24px_rgba(37,45,100,0.08)]">
          {draft.metrics.map((item) => {
            const active = item.key === currentKey;
            const itemTone = metricTones[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCurrentKey(item.key)}
                aria-pressed={active}
                className={`flex h-12 items-center justify-center gap-1.5 rounded-[18px] px-2 text-[13px] font-black leading-none transition active:scale-[0.98] ${
                  active
                    ? "bg-[#f4f2ff] text-[#6351ea]"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
                style={active ? { color: itemTone.accent } : undefined}
              >
                <MetricIcon metricKey={item.key} className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        <section className="flex min-h-[268px] flex-1 flex-col rounded-[20px] border border-[#edf0ff] bg-white px-4 py-5 shadow-[0_14px_34px_rgba(37,45,100,0.10)]">
          <p className="text-center text-[12px] font-bold text-slate-500">
            {metric.label}
          </p>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mt-1 flex items-end justify-center gap-2">
              <input
                type="number"
                step={metric.step}
                min={metric.min}
                max={metric.max}
                value={Number.isFinite(currentValue) ? currentValue : ""}
                onChange={(event) =>
                  handleValueChange(Number(event.target.value || metric.min))
                }
                className="body-metric-number w-[150px] bg-transparent text-center text-[52px] font-black leading-none outline-none"
                style={{ color: tone.accent }}
                aria-label={metric.label}
              />
              <span className="pb-1.5 text-[16px] font-black text-slate-400">
                {metric.unit}
              </span>
            </div>
            <p className="mt-4 text-center text-[12px] font-semibold leading-5 text-slate-400">
              {metric.helper}
            </p>
          </div>

          <div className="pt-8">
            <input
              type="range"
              min={metric.min}
              max={metric.max}
              step={metric.step}
              value={currentValue}
              onChange={(event) => handleValueChange(Number(event.target.value))}
              className="body-metric-range"
              style={rangeStyle}
              aria-label={`${metric.label} 조절`}
            />
            <div className="mt-2 flex justify-between px-0.5 text-[11px] font-bold text-slate-400">
              <span>{metric.min.toFixed(1)}</span>
              <span>{metric.max.toFixed(1)}</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2.5" aria-label="신체 지표 요약">
          {draft.metrics.map((item) => {
            const active = item.key === currentKey;
            const itemTone = metricTones[item.key];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCurrentKey(item.key)}
                aria-pressed={active}
                className={`flex min-h-[110px] flex-col items-center justify-center rounded-[16px] border p-3.5 text-center shadow-[0_8px_18px_rgba(37,45,100,0.08)] transition active:scale-[0.98] ${
                  active
                    ? "border-transparent text-white"
                    : "border-[#eef0f8] bg-white text-slate-500"
                }`}
                style={
                  active
                    ? {
                        background: itemTone.gradient,
                        boxShadow: itemTone.shadow,
                      }
                    : undefined
                }
              >
                <span
                  className={`grid size-10 place-items-center rounded-[12px] ${
                    active ? "bg-white/20" : "bg-[#f4f2ff]"
                  }`}
                  style={!active ? { color: itemTone.accent } : undefined}
                >
                  <MetricIcon metricKey={item.key} className="size-5" />
                </span>
                <p
                  className={`mt-3 text-[11px] font-bold ${
                    active ? "text-white/82" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </p>
                <p className="mt-2 text-[19px] font-black leading-none">
                  {formatMetricValue(values[item.key])}
                  <span className="ml-1 text-[10px] font-bold">
                    {item.unit}
                  </span>
                </p>
              </button>
            );
          })}
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ece8ff] bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_28px_rgba(79,70,229,0.10)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[390px] flex-col gap-2">
          {savedLabel ? (
            <p className="text-center text-[11px] font-bold text-emerald-600">
              {savedLabel}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="text-center text-[11px] font-bold text-rose-500">
              {errorMessage}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="h-[52px] w-full rounded-[16px] text-[16px] font-black text-white shadow-[0_12px_22px_rgba(96,72,220,0.26)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: tone.gradient }}
          >
            {saving ? "저장 중" : draft.primaryActionLabel || "저장하기"}
          </button>
        </div>
      </footer>
    </div>
  );
}
