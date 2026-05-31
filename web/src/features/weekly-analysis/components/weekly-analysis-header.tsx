"use client";

import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
} from "@/components/icons";
import { FitLogMark } from "@/features/account/components/brand-icons";

type WeeklyAnalysisHeaderProps = {
  weekLabel: string;
  dateRange: string;
  previousWeekHref: string;
  nextWeekHref: string;
  canViewNextWeek: boolean;
};

export function WeeklyAnalysisHeader({
  weekLabel,
  dateRange,
  previousWeekHref,
  nextWeekHref,
  canViewNextWeek,
}: WeeklyAnalysisHeaderProps) {
  const router = useRouter();

  function navigateTo(href: string) {
    router.push(href);
  }

  return (
    <header className="mx-auto w-full max-w-[390px] px-4 pt-4">
      <div className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f1efff] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#6653e9]">
            <FitLogMark className="size-3" />
            <span>Weekly Review</span>
          </div>
          <button
            type="button"
            className="grid size-8 place-items-center rounded-full bg-[#f1efff] text-[#6653e9] transition hover:bg-violet-100"
            aria-label="통계 공유"
          >
            <ShareIcon className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-[32px_1fr_32px] items-center gap-1">
          <button
            type="button"
            onClick={() => navigateTo(previousWeekHref)}
            className="grid size-8 place-items-center rounded-[10px] text-[#6653e9] transition hover:bg-[#f1efff]"
            aria-label="이전 주"
          >
            <ChevronLeftIcon className="size-5 stroke-[2.4]" />
          </button>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-[22px] font-black leading-tight tracking-normal text-[#19144f]">
              {weekLabel}
            </h1>
            <p className="mx-auto mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1efff] px-3 py-1.5 text-[10px] font-black text-[#6653e9]">
              <CalendarIcon className="size-3.5 shrink-0" />
              <span className="truncate">{dateRange}</span>
            </p>
          </div>

          {canViewNextWeek ? (
            <button
              type="button"
              onClick={() => navigateTo(nextWeekHref)}
              className="grid size-8 place-items-center rounded-[10px] text-[#6653e9] transition hover:bg-[#f1efff]"
              aria-label="다음 주"
            >
              <ChevronRightIcon className="size-5 stroke-[2.4]" />
            </button>
          ) : (
            <span aria-hidden="true" className="size-8" />
          )}
        </div>
      </div>
    </header>
  );
}
