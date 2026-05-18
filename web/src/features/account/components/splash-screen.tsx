"use client";

import { useEffect, useState } from "react";
import { getSocialLoginRedirectUrl } from "../api";
import type { SocialLoginData, SplashData } from "../types";
import { FitLogMark, ProviderLogo } from "./brand-icons";

type SplashScreenProps = {
  data: SplashData;
  loginData: SocialLoginData;
  initialShowLogin?: boolean;
};

const providerStyles = {
  kakao: "bg-[#FEE500] text-[#191919]",
  google: "border border-slate-200 bg-white text-slate-800",
} as const;

export function SplashScreen({
  data,
  loginData,
  initialShowLogin = false,
}: SplashScreenProps) {
  const [showLogin, setShowLogin] = useState(initialShowLogin);
  const [loadingProvider, setLoadingProvider] = useState<
    SocialLoginData["options"][number]["providerType"] | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (showLogin) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowLogin(true);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [showLogin]);

  const handleLogin = async (
    providerType: SocialLoginData["options"][number]["providerType"],
  ) => {
    setLoadingProvider(providerType);
    setErrorMessage(null);

    try {
      const redirectUrl = await getSocialLoginRedirectUrl(providerType);
      window.location.assign(redirectUrl);
    } catch {
      setErrorMessage("로그인 서버에 연결할 수 없습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-white">
      <main className="relative flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#6657ff_0%,#5141ee_58%,#4735dd_100%)] px-6 text-white">
        <section
          className={`flex flex-col items-center text-center transition duration-700 ease-out ${
            showLogin ? "-translate-y-12" : "translate-y-0"
          }`}
        >
          <div className="mb-5 flex size-20 items-center justify-center rounded-[24px] bg-white text-[#5a4df3] shadow-[0_18px_38px_rgba(31,25,103,0.24)]">
            <FitLogMark className="size-11" />
          </div>
          <h1 className="text-[28px] font-black leading-none tracking-normal">
            {data.title}
          </h1>
          <p className="mt-3 text-xs font-medium leading-5 text-white/70">
            {data.subtitle}
          </p>
        </section>

        <div
          className={`absolute right-6 bottom-12 left-6 transition duration-700 ease-out ${
            showLogin
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-8 opacity-0"
          }`}
        >
          <div className="space-y-3 rounded-[8px] bg-white p-3 shadow-[0_20px_55px_rgba(26,21,92,0.28)]">
            {loginData.options.map((option) => {
              const loading = loadingProvider === option.providerType;

              return (
                <button
                  key={option.providerType}
                  type="button"
                  onClick={() => void handleLogin(option.providerType)}
                  disabled={loadingProvider !== null}
                  className={`flex h-12 w-full items-center justify-center gap-3 rounded-[8px] text-sm font-bold transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 ${providerStyles[option.tone]}`}
                >
                  <span className="flex size-6 items-center justify-center text-[#191919]">
                    <ProviderLogo
                      providerType={option.providerType}
                      className="size-5"
                    />
                  </span>
                  <span>{loading ? "로그인 중..." : option.label}</span>
                </button>
              );
            })}
          </div>

          {errorMessage ? (
            <p className="mt-3 rounded-[8px] bg-white px-4 py-3 text-center text-xs font-bold leading-5 text-rose-600">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <p className="absolute bottom-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
          {data.versionLabel}
        </p>
      </main>
    </div>
  );
}
