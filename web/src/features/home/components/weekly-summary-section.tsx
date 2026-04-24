import Link from "next/link";
import type { HomeDashboard } from "../types";

type WeeklySummarySectionProps = {
  weeklySummary: HomeDashboard["weeklySummary"];
};

export function WeeklySummarySection({
  weeklySummary,
}: WeeklySummarySectionProps) {
  return (
    <section className="rounded-[28px] border border-indigo-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">이번 주 요약</h2>
          <p className="text-xs text-slate-400">
            Figma 홈 화면과 같은 카드 단위를 기준으로 분해
          </p>
        </div>
        <Link
          href="/weekly-record-analysis"
          className="text-xs font-semibold text-indigo-600"
        >
          상세 보기
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {weeklySummary.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
          >
            <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
            <p className={`mt-1 text-lg font-black ${item.valueClass}`}>
              {item.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
