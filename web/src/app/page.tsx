import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import {
  CheckCircleIcon,
  ClockIcon,
  DumbbellIcon,
  FireIcon,
  UtensilsIcon,
} from "@/components/icons";
import { getHomeDashboard } from "@/lib/dashboard-data";

function ProgressRow({
  label,
  percent,
  colorClass,
}: {
  label: string;
  percent: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="text-slate-400">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const dashboard = await getHomeDashboard();

  return (
    <div className="pb-40">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">FitLog</h1>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <button
              type="button"
              className="p-2"
              aria-label="알림"
            >
              <img
                src="/icons/custom/bell.svg"
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                loading="eager"
                className="block size-5"
              />
            </button>
            <button
              type="button"
              className="p-2"
              aria-label="캘린더"
            >
              <img
                src="/icons/custom/calendar.svg"
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                loading="eager"
                className="block size-5"
              />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 text-slate-900 shadow-sm backdrop-blur-sm">
          <div className="mb-5">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {dashboard.dateLabel} 기록
              </p>
              <h2 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">
                {dashboard.recordHeadline}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard.recordChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">오늘 요약</h2>
              <p className="text-xs text-slate-400">{dashboard.dateLabel}</p>
            </div>
            <div className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600">
              목표 {dashboard.goalPercent}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {dashboard.summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <div
                  className={`mt-2 flex gap-1.5 ${
                    card.status && !card.subValue ? "items-center" : "items-end"
                  }`}
                >
                  {card.status && !card.subValue ? (
                    <CheckCircleIcon className="size-5 text-emerald-600" />
                  ) : null}
                  <p
                    className={`text-lg font-black ${
                      card.status && !card.subValue
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}
                  >
                    {card.value}
                  </p>
                  {card.subValue ? (
                    <span className="pb-0.5 text-xs text-slate-400">
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

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                오늘 식단 진행 현황
              </h2>
              <p className="text-xs text-slate-400">
                칼로리와 영양 비율을 서버 컴포넌트에서 렌더링
              </p>
            </div>
            <div className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-500">
              {dashboard.nutritionStatus}
            </div>
          </div>

          <div className="space-y-4">
            {dashboard.nutritionProgress.map((item) => (
              <ProgressRow
                key={item.label}
                label={item.label}
                percent={item.percent}
                colorClass={item.colorClass}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-indigo-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {dashboard.workout.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {dashboard.workout.routine}
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-right">
              <p className="text-[11px] font-medium text-slate-400">진행률</p>
              <p className="text-sm font-black text-indigo-600">
                {dashboard.workout.progressLabel}
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
              <ClockIcon className="size-4" />
              {dashboard.workout.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-500">
              <FireIcon className="size-4" />
              {dashboard.workout.calories}
            </span>
          </div>

          <Link
            href="/today-workout-log"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            이어서 운동 기록하기
          </Link>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
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
            {dashboard.weeklySummary.map((item) => (
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
      </main>

      <div className="fixed inset-x-0 bottom-[84px] z-20 mx-auto max-w-md px-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/today-meal-log"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-orange-100 bg-white px-4 py-4 text-sm font-bold text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
          >
            <UtensilsIcon className="size-5 text-orange-500" />
            식단 기록하기
          </Link>
          <Link
            href="/today-workout-log"
            className="flex items-center justify-center gap-2 rounded-[22px] border border-indigo-100 bg-white px-4 py-4 text-sm font-bold text-slate-800 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
          >
            <DumbbellIcon className="size-5 text-indigo-500" />
            운동 기록하기
          </Link>
        </div>
      </div>

      <BottomNav current="home" />
    </div>
  );
}
