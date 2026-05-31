import {
  ClockIcon,
  DumbbellIcon,
  FireIcon,
  TrendingUpIcon,
} from "@/components/icons";
import type { WeeklyAnalysis } from "../types";

type WeeklyWorkoutSectionProps = {
  totalWorkout: string;
  comparison: string;
  workoutBars: WeeklyAnalysis["workoutBars"];
  kpis: WeeklyAnalysis["kpis"];
};

export function WeeklyWorkoutSection({
  totalWorkout,
  comparison,
  workoutBars,
  kpis,
}: WeeklyWorkoutSectionProps) {
  const workoutSummary = splitWorkoutSummary(totalWorkout);

  return (
    <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="inline-flex min-w-0 flex-1 items-center gap-1.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#7563f1] text-white">
            <ClockIcon className="size-3.5" />
          </span>
          <h2 className="min-w-0 truncate text-[13px] font-black leading-none text-[#22243d]">
            주간 운동 시간
          </h2>
        </div>

        <span className="inline-flex max-w-[116px] shrink-0 items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-black leading-none text-[#6653e9]">
          <TrendingUpIcon className="size-3.5 shrink-0" />
          <span className="truncate">{comparison}</span>
        </span>
      </div>

      <p className="text-[12px] font-bold leading-none text-slate-500">
        <span className="mr-1">총</span>
        <span className="text-[18px] font-black text-[#6653e9]">
          {workoutSummary.value}
        </span>
      </p>

      <div className="relative mt-4 h-[164px]">
        <div className="absolute inset-x-0 bottom-[28px] border-t border-dashed border-violet-200" />
        <div className="grid h-full grid-cols-7 items-end gap-1.5">
          {workoutBars.map((bar) => (
            <div
              key={bar.label}
              className="flex h-full min-w-0 flex-col items-center justify-end"
            >
              <div className="flex h-[126px] w-full items-end justify-center">
                {bar.height > 0 ? (
                  <div
                    className={`w-2.5 rounded-full ${
                      bar.active
                        ? "bg-gradient-to-b from-fuchsia-300 to-violet-600 shadow-[0_10px_22px_rgba(147,51,234,0.24)]"
                        : "bg-gradient-to-b from-fuchsia-300 to-violet-400"
                    }`}
                    style={{ height: `${Math.max(bar.height, 14)}%` }}
                  />
                ) : null}
              </div>
              <span
                className={`mt-2 text-[11px] font-bold leading-none ${
                  bar.active ? "text-[#6653e9]" : "text-slate-500"
                }`}
              >
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {kpis.map((kpi) => {
          const isCalorie = isCalorieKpi(kpi);
          const Icon = isCalorie ? FireIcon : DumbbellIcon;

          return (
            <div
              key={kpi.label}
              className="min-h-[83px] rounded-[10px] border border-[#eef0f8] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(45,50,92,0.04)]"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-[27px] shrink-0 place-items-center rounded-full bg-[#f1efff] text-[#6653e9]">
                  <Icon className="size-4" />
                </span>
                <p className="min-w-0 truncate text-[11px] font-bold text-slate-500">
                  {formatKpiLabel(kpi.label)}
                </p>
              </div>
              <p className="mt-4 whitespace-nowrap text-[17px] font-black leading-none text-[#6653e9]">
                {formatKpiValue(kpi.value)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function splitWorkoutSummary(totalWorkout: string) {
  const cleaned = totalWorkout
    .replace(/^총\s*/, "")
    .replace(/\s*운동했어요\.?$/, "")
    .trim();

  return {
    value: cleaned || "0분",
  };
}

function isCalorieKpi(kpi: WeeklyAnalysis["kpis"][number]) {
  return kpi.label.includes("칼로리") || kpi.value.toLowerCase().includes("kcal");
}

function formatKpiLabel(label: string) {
  if (label.includes("세션") || label.includes("횟수")) {
    return "운동 횟수";
  }

  return label;
}

function formatKpiValue(value: string) {
  return value.replace(/\s+kcal$/i, "kcal");
}
