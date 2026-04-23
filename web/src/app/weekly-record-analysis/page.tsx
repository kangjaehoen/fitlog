import { BottomNav } from "@/components/bottom-nav";
import {
  ChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  SparklesIcon,
} from "@/components/icons";
import { getWeeklyAnalysis } from "@/lib/dashboard-data";

export const metadata = {
  title: "주간 통계 분석",
};

export default async function WeeklyRecordAnalysisPage() {
  const analysis = await getWeeklyAnalysis();

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-500">
                Weekly Review
              </p>
              <h1 className="text-2xl font-black text-slate-900">통계</h1>
            </div>
            <button
              type="button"
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              aria-label="공유"
            >
              <ShareIcon className="size-5" />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50 px-3 py-3">
            <button
              type="button"
              className="rounded-2xl bg-white p-2.5 text-slate-500 shadow-sm"
              aria-label="이전 주"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <div className="text-center">
              <p className="text-lg font-black text-slate-900">{analysis.weekLabel}</p>
              <p className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
                {analysis.dateRange}
              </p>
            </div>
            <button
              type="button"
              className="rounded-2xl bg-slate-100 p-2.5 text-slate-300"
              aria-label="다음 주"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                주간 운동 시간
              </h2>
              <p className="mt-1 text-sm text-slate-400">{analysis.totalWorkout}</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
              {analysis.comparison}
            </span>
          </div>

          <div className="flex h-48 items-end justify-between gap-2 rounded-[24px] bg-slate-50 px-4 pb-6 pt-4">
            {analysis.workoutBars.map((bar) => (
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
            {analysis.kpis.map((kpi) => (
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

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-black text-slate-900">주간 영양 성분 비율</h2>
          <div className="mt-5 flex items-center gap-6">
            <div
              className="relative grid size-28 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#4f46e5 0 42%, #60a5fa 42% 80%, #f59e0b 80% 100%)",
              }}
            >
              <div className="grid size-18 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-[10px] font-medium text-slate-400">상태</p>
                  <p className="text-xs font-black text-slate-700">안정</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {analysis.macros.map((macro) => (
                <div
                  key={macro.label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="font-medium text-slate-500">{macro.label}</span>
                  </div>
                  <span className="font-black text-slate-900">{macro.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm leading-relaxed text-indigo-900">
            <p className="inline-flex items-start gap-2">
              <SparklesIcon className="mt-0.5 size-4 shrink-0 text-indigo-500" />
              <span>
                <strong>AI 분석:</strong> {analysis.insight}
              </span>
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">체중 트렌드</h2>
            <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
              <ChartIcon className="size-4" />
              {analysis.weightWindow}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-slate-50 px-3 py-5">
            <div className="flex h-24 items-end justify-between gap-2 border-b border-slate-200 px-2 pb-4">
              {analysis.weightBars.map((bar, index) => (
                <div
                  key={`${bar.height}-${index}`}
                  className={`w-2 rounded-full ${
                    index >= analysis.weightBars.length - 3
                      ? "bg-indigo-500"
                      : "bg-slate-200"
                  }`}
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {analysis.weightStats.map((stat) => (
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
      </main>

      <BottomNav current="stats" />
    </div>
  );
}
