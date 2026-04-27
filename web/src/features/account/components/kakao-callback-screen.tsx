"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loginWithKakaoCode } from "../api";
import { persistAuthSession } from "../auth-session";

export function KakaoCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const code = searchParams.get("code");
  const kakaoError = searchParams.get("error");
  const validationError = kakaoError
    ? "카카오 로그인이 취소되었거나 실패했습니다."
    : code
      ? null
      : "카카오 인증 코드가 없습니다. 다시 로그인해주세요.";
  const displayError = validationError ?? errorMessage;

  useEffect(() => {
    if (validationError || !code) {
      return;
    }

    const authorizationCode = code;
    let active = true;

    async function completeLogin() {
      try {
        const response = await loginWithKakaoCode(authorizationCode);
        if (!active) {
          return;
        }

        persistAuthSession(response);
        router.replace("/main");
      } catch {
        if (active) {
          setErrorMessage("카카오 로그인 처리 중 문제가 발생했습니다.");
        }
      }
    }

    void completeLogin();

    return () => {
      active = false;
    };
  }, [code, router, validationError]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <main className="w-full max-w-[360px] rounded-[8px] border border-slate-100 bg-slate-50 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Kakao Login
        </p>
        <h1 className="mt-3 text-xl font-black text-slate-900">
          {displayError ? "로그인 실패" : "로그인 처리 중"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {displayError ?? "카카오 계정을 FitLog에 연결하고 있습니다."}
        </p>
        {displayError ? (
          <button
            type="button"
            onClick={() => router.replace("/social-login")}
            className="mt-5 h-11 w-full rounded-[8px] bg-slate-900 text-sm font-bold text-white"
          >
            다시 로그인하기
          </button>
        ) : null}
      </main>
    </div>
  );
}
