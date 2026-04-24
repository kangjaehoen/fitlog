"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, XIcon } from "@/components/icons";

type StackHeaderProps = {
  title: string;
  fallbackHref: string;
  action?: "back" | "close";
  trailing?: ReactNode;
};

export function StackHeader({
  title,
  fallbackHref,
  action = "back",
  trailing,
}: StackHeaderProps) {
  const router = useRouter();

  const handleNavigate = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-md items-center px-4 py-4">
        <button
          type="button"
          onClick={handleNavigate}
          aria-label={action === "close" ? "닫기" : "뒤로가기"}
          className="inline-flex size-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
        >
          {action === "close" ? (
            <XIcon className="size-5" />
          ) : (
            <ChevronLeftIcon className="size-5" />
          )}
        </button>

        <h1 className="pointer-events-none absolute inset-x-0 text-center text-base font-bold text-slate-900">
          {title}
        </h1>

        <div className="ml-auto flex min-w-11 justify-end">{trailing}</div>
      </div>
    </header>
  );
}
