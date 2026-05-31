import {
  CheckCircleIcon,
  DumbbellIcon,
  FireIcon,
  SparklesIcon,
} from "@/components/icons";
import type { HomeDashboard } from "../types";

type DailySummarySectionProps = {
  dateLabel: string;
  summaryCards: HomeDashboard["summaryCards"];
};

type SummaryCard = HomeDashboard["summaryCards"][number];

function formatSummaryDate(dateLabel: string) {
  return dateLabel.replace(/^\d{4}년\s*/, "");
}

function visibleSummaryCards(summaryCards: HomeDashboard["summaryCards"]) {
  return summaryCards
    .filter((card) => card.label !== "체중")
    .slice(0, 3);
}

function ProteinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.4 15.4 15.4 6.4a4.4 4.4 0 0 1 6.2 6.2l-9 9a4.4 4.4 0 0 1-6.2-6.2Z" />
      <path d="m10 11 3 3" />
      <path d="m13 8 3 3" />
    </svg>
  );
}

function SummaryIcon({ card }: { card: SummaryCard }) {
  if (card.label.includes("단백질")) {
    return <ProteinIcon className="size-4" />;
  }

  if (card.label.includes("운동")) {
    return <DumbbellIcon className="size-4" />;
  }

  return <FireIcon className="size-4" />;
}

function iconToneFor(card: SummaryCard) {
  if (card.label.includes("단백질")) {
    return "bg-[#b46ff2] text-white";
  }

  if (card.label.includes("운동")) {
    return "bg-[#7489f8] text-white";
  }

  return "bg-[#8472f6] text-white";
}

function TrophyCard() {
  return (
    <div className="relative min-h-[83px] overflow-hidden rounded-[10px] border border-[#f0effb] bg-[#f5f2ff] shadow-[0_8px_20px_rgba(82,63,172,0.06)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_74%,rgba(119,96,240,0.16),transparent_45%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 112 86"
        className="absolute inset-x-0 bottom-0 mx-auto h-[82px] w-[108px]"
      >
        <path d="M21 25h13v7c0 8-5.3 14.5-13 15.8V39c4.6-1.1 7-3.9 7-8h-7v-6Z" fill="#a799ff" />
        <path d="M78 25h13v6c0 4.1 2.4 6.9 7 8v8.8C90.3 46.5 85 40 85 32v-7h-7Z" fill="#a799ff" />
        <path d="M35 18h42v18c0 12.2-9.8 22-22 22S35 48.2 35 36V18Z" fill="#7e68f3" />
        <path d="M44 25h24v10c0 7.2-5.8 13-13 13s-11-5.8-11-13V25Z" fill="#af9fff" opacity="0.9" />
        <path d="M51 57h10v10H51z" fill="#6b56e7" />
        <path d="M42 67h28l5 10H37l5-10Z" fill="#7e68f3" />
        <circle cx="29" cy="16" r="2.4" fill="#9b8cff" />
        <circle cx="87" cy="15" r="2" fill="#9b8cff" />
        <path d="M21 58 17 54M93 56l4-4M18 37l-5-2M94 36l5-2" stroke="#9b8cff" strokeWidth="3" strokeLinecap="round" />
        <path d="m52 10-1.8-5M64 11l2.2-5" stroke="#c8c0ff" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function DailySummarySection({
  dateLabel,
  summaryCards,
}: DailySummarySectionProps) {
  const cards = visibleSummaryCards(summaryCards);

  return (
    <section className="rounded-[14px] border border-[#edf0ff] bg-white p-3 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
        <div className="inline-flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-[#7563f1] text-white">
            <SparklesIcon className="size-2.5" />
          </span>
          <h2 className="text-[13px] font-black leading-none text-[#22243d]">
            오늘 요약
          </h2>
        </div>
        <p className="text-[12px] font-medium leading-none text-slate-500">
          {formatSummaryDate(dateLabel)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="min-h-[83px] rounded-[10px] border border-[#eef0f8] bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(45,50,92,0.04)]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid size-[27px] place-items-center rounded-full ${iconToneFor(
                  card,
                )}`}
              >
                <SummaryIcon card={card} />
              </span>
              <p className="text-[11px] font-bold text-slate-500">
                {card.label}
              </p>
            </div>
            <div
              className={`mt-4 flex gap-1.5 ${
                card.status && !card.subValue ? "items-center" : "items-end"
              }`}
            >
              {card.status && !card.subValue ? (
                <CheckCircleIcon className="size-[19px] text-[#6f83f6]" />
              ) : null}
              <p
                className={`text-[19px] font-black leading-none ${
                  card.status && !card.subValue
                    ? "text-[#1e2440]"
                    : "text-[#1d2138]"
                }`}
              >
                {card.value}
              </p>
              {card.subValue ? (
                <span className="inline-block translate-y-px text-[9px] font-medium leading-none text-slate-500">
                  {card.subValue}
                </span>
              ) : null}
            </div>
          </div>
        ))}
        <TrophyCard />
      </div>
    </section>
  );
}
