import Link from "next/link";
import { DumbbellIcon, UtensilsIcon } from "@/components/icons";

export function QuickActions() {
  return (
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
  );
}
