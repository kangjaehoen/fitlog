"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginWithSocialProvider } from "../api";
import { persistAuthSession } from "../auth-session";
import type { SocialLoginData } from "../types";

type SocialLoginScreenProps = {
  data: SocialLoginData;
};

const toneStyles = {
  kakao: "bg-[#FEE500] text-[#191919]",
  google: "border border-slate-200 bg-white text-slate-700 shadow-sm",
  apple: "bg-black text-white",
} as const;

export function SocialLoginScreen({ data }: SocialLoginScreenProps) {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<
    SocialLoginData["options"][number]["providerType"] | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (
    providerType: SocialLoginData["options"][number]["providerType"],
  ) => {
    setLoadingProvider(providerType);
    setErrorMessage(null);

    try {
      const response = await loginWithSocialProvider(providerType);
      persistAuthSession(response);
      router.push("/main");
    } catch {
      setErrorMessage("로그인 서버에 연결할 수 없습니다. 서버와 DB 설정을 확인해주세요.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <main className="w-full max-w-[360px] rounded-[32px] border border-slate-100 bg-slate-50/60 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
            Welcome
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {data.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{data.subtitle}</p>
        </div>

        <div className="space-y-3">
          {data.options.map((option) => {
            const loading = loadingProvider === option.providerType;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => void handleLogin(option.providerType)}
                disabled={loadingProvider !== null}
                className={`flex h-14 w-full items-center justify-center gap-3 rounded-[16px] text-[16px] font-bold transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 ${toneStyles[option.tone]}`}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white/70 text-sm font-black text-slate-900">
                  {option.provider}
                </span>
                <span>{loading ? "로그인 중..." : option.label}</span>
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-xs font-bold leading-5 text-rose-600">
            {errorMessage}
          </p>
        ) : null}
      </main>
    </div>
  );
}
