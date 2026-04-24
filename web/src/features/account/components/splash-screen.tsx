"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SplashData } from "../types";

type SplashScreenProps = {
  data: SplashData;
};

export function SplashScreen({ data }: SplashScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace(data.redirectHref);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [data.redirectHref, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-indigo-600 px-8">
      <div className="absolute -top-10 -left-12 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-16 size-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative text-center text-white">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-[2.5rem] bg-white text-4xl font-black text-indigo-600 shadow-2xl">
          F
        </div>
        <h1 className="text-4xl font-black tracking-tight">{data.title}</h1>
        <p className="mt-3 text-sm font-medium text-indigo-100/90">
          {data.subtitle}
        </p>
        <div className="mx-auto mt-8 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-white" />
        </div>
        <p className="mt-16 text-[10px] font-medium uppercase tracking-[0.28em] text-indigo-200/70">
          {data.versionLabel}
        </p>
      </div>
    </div>
  );
}
