import { ChartIcon } from "@/components/icons";
import type { WeeklyAnalysis } from "../types";

type WeightTrendSectionProps = {
  weightWindow: string;
  weightBars: WeeklyAnalysis["weightBars"];
  weightStats: WeeklyAnalysis["weightStats"];
};

export function WeightTrendSection({
  weightWindow,
  weightBars,
  weightStats,
}: WeightTrendSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">체중 트렌드</h2>
        <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
          <ChartIcon className="size-4" />
          {weightWindow}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] bg-slate-50 px-3 py-5">
        <div className="flex h-24 items-end justify-between gap-2 border-b border-slate-200 px-2 pb-4">
          {weightBars.map((bar, index) => (
            <div
              key={`${bar.height}-${index}`}
              className={`w-2 rounded-full ${
                index >= weightBars.length - 3 ? "bg-indigo-500" : "bg-slate-200"
              }`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {weightStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[11px] font-medium text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-1 text-sm font-black ${stat.valueClass}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
