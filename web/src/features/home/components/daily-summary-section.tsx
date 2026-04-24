import { CheckCircleIcon } from "@/components/icons";
import type { HomeDashboard } from "../types";

type DailySummarySectionProps = {
  dateLabel: string;
  summaryCards: HomeDashboard["summaryCards"];
};

function formatSummaryDate(dateLabel: string) {
  return dateLabel
    .replace(/^\d{4}년\s*/, "")
    .replace(/\s+\((.)\)/, "($1)");
}

export function DailySummarySection({
  dateLabel,
  summaryCards,
}: DailySummarySectionProps) {
  return (
    <section className="rounded-[28px] border border-indigo-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-[18px] font-black leading-none text-slate-900">
          오늘 요약
        </h2>
        <p className="text-[12px] font-medium leading-none text-slate-500">
          {formatSummaryDate(dateLabel)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100"
          >
            <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
            <div
              className={`mt-2 flex gap-1.5 ${
                card.status && !card.subValue ? "items-center" : "items-end"
              }`}
            >
              {card.status && !card.subValue ? (
                <CheckCircleIcon className="size-[18px] text-emerald-600" />
              ) : null}
              <p
                className={`text-[15px] font-black leading-none ${
                  card.status && !card.subValue
                    ? "text-emerald-600"
                    : "text-slate-900"
                }`}
              >
                {card.value}
              </p>
              {card.subValue ? (
                <span className="inline-block translate-y-px text-[11px] leading-none text-slate-400">
                  {card.subValue}
                </span>
              ) : null}
            </div>
            {card.status && card.subValue ? (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircleIcon className="size-4" />
                {card.status}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
