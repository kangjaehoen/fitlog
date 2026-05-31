import Link from "next/link";
import { BellIcon, UserIcon } from "@/components/icons";

type HomeHeaderProps = {
  hasUnreadNotifications: boolean;
};

function FitLogLogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[22px] shrink-0 text-[#6351ea]"
      fill="currentColor"
    >
      <rect x="4" y="4" width="4.4" height="8.4" rx="1.6" />
      <rect x="9.8" y="2.8" width="4.4" height="9.6" rx="1.6" />
      <rect x="15.6" y="5" width="4.4" height="7.4" rx="1.6" />
      <path d="M5.1 11.2h13.8v4.1c0 3.1-2.5 5.7-5.7 5.7h-2.4a5.7 5.7 0 0 1-5.7-5.7v-4.1Z" />
      <path d="M3 9.4c0-.9.7-1.6 1.6-1.6h1.1v5.1H4.6C3.7 12.9 3 12.2 3 11.3V9.4Z" />
    </svg>
  );
}

export function HomeHeader({ hasUnreadNotifications }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#f8f8ff]/95 backdrop-blur-[20px]">
      <div className="mx-auto flex w-full max-w-[390px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/main" className="inline-flex items-center gap-1.5">
          <FitLogLogoMark />
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
