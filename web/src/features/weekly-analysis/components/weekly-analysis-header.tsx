import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
} from "@/components/icons";

type WeeklyAnalysisHeaderProps = {
  weekLabel: string;
  dateRange: string;
};

export function WeeklyAnalysisHeader({
  weekLabel,
  dateRange,
}: WeeklyAnalysisHeaderProps) {
  return (
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
            <p className="text-lg font-black text-slate-900">{weekLabel}</p>
            <p className="mt-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
              {dateRange}
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
  );
}
