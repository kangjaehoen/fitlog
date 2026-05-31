import Link from "next/link";
import {
  ChevronRightIcon,
  DumbbellIcon,
  UtensilsIcon,
} from "@/components/icons";

export function QuickActions() {
  return (
    <div className="fixed inset-x-0 bottom-[88px] z-[9] px-4">
      <div className="mx-auto grid w-full max-w-[390px] grid-cols-2 gap-2">
        <Link
          href="/today-meal-log"
          className="flex h-[46px] items-center justify-center gap-1.5 rounded-[10px] border border-[#ffccb7] bg-white px-2 text-[12px] font-black text-[#ff7043] shadow-[0_10px_24px_rgba(45,50,92,0.08)] transition hover:-translate-y-0.5"
        >
          <UtensilsIcon className="size-4 shrink-0" />
          식단 기록하기
          <ChevronRightIcon className="size-3.5 shrink-0" />
        </Link>
        <Link
          href="/today-workout-log"
          className="flex h-[46px] items-center justify-center gap-1.5 rounded-[10px] border border-[#c9c2ff] bg-white px-2 text-[12px] font-black text-[#6250e8] shadow-[0_10px_24px_rgba(45,50,92,0.08)] transition hover:-translate-y-0.5"
        >
          <DumbbellIcon className="size-4 shrink-0" />
          운동 기록하기
          <ChevronRightIcon className="size-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
