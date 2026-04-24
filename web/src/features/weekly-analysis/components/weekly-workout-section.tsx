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
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">주간 운동 시간</h2>
          <p className="mt-1 text-sm text-slate-400">{totalWorkout}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
          {comparison}
        </span>
      </div>

      <div className="flex h-48 items-end justify-between gap-2 rounded-[24px] bg-slate-50 px-4 pb-6 pt-4">
        {workoutBars.map((bar) => (
          <div
            key={bar.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="relative flex h-full w-full items-end justify-center">
              <div
                className={`w-full rounded-t-[14px] ${
                  bar.active ? "bg-indigo-600" : "bg-slate-200"
                }`}
                style={{ height: `${bar.height}%` }}
              />
            </div>
            <span
              className={`text-[11px] font-bold ${
                bar.active ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
          >
            <p className="text-[11px] font-medium text-slate-400">{kpi.label}</p>
            <p className={`mt-1 text-xl font-black ${kpi.valueClass}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
