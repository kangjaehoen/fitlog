import Link from "next/link";
import {
  ChartIcon,
  HomeIcon,
  ListIcon,
  UserIcon,
} from "@/components/icons";

type NavKey = "home" | "routine" | "stats" | "mypage";

const items: Array<{
  href: string;
  label: string;
  key: NavKey;
  icon: typeof HomeIcon;
}> = [
  { href: "/", label: "홈", key: "home", icon: HomeIcon },
  {
    href: "/fitness-routine",
    label: "루틴",
    key: "routine",
    icon: ListIcon,
  },
  {
    href: "/weekly-record-analysis",
    label: "통계",
    key: "stats",
    icon: ChartIcon,
  },
  { href: "/mypage", label: "마이", key: "mypage", icon: UserIcon },
];

export function BottomNav({ current }: { current: NavKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-white/70 bg-white/90 backdrop-blur-[20px]">
      <div className="mx-auto flex h-[78px] w-full max-w-[420px] items-center justify-around px-2">
        {items.map((item) => {
          const active = item.key === current;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-16 flex-col items-center gap-1.5 rounded-[18px] px-3 py-2 text-[11px] font-bold transition ${
                active
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
