import Link from "next/link";
import { BellIcon, UserIcon } from "@/components/icons";
import { FitLogMark } from "@/features/account/components/brand-icons";

type HomeHeaderProps = {
  hasUnreadNotifications: boolean;
};

export function HomeHeader({ hasUnreadNotifications }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#f8f8ff]/95 backdrop-blur-[20px]">
      <div className="mx-auto flex w-full max-w-[390px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/main" className="inline-flex items-center gap-2">
          <FitLogMark priority className="size-9 shrink-0" />
          <h1 className="text-[19px] font-black leading-none text-[#6351ea]">
            FitLog
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative grid size-8 place-items-center rounded-full bg-white text-[#6351ea] shadow-[0_8px_18px_rgba(99,81,234,0.12)] ring-1 ring-[#ece8ff]"
            aria-label="알림함"
          >
            <BellIcon className="size-[17px]" />
            {hasUnreadNotifications ? (
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            ) : null}
          </Link>
          <Link
            href="/mypage"
            className="grid size-8 place-items-center rounded-full bg-white text-[#6351ea] shadow-[0_8px_18px_rgba(99,81,234,0.12)] ring-1 ring-[#ece8ff]"
            aria-label="마이페이지"
          >
            <UserIcon className="size-[17px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
