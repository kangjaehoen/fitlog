"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loginWithGoogleCode } from "../api";
import { persistAuthSession } from "../auth-session";

export function GoogleCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const code = searchParams.get("code");
  const googleError = searchParams.get("error");
  const validationError = googleError
    ? "Google login was canceled or failed."
    : code
      ? null
      : "Google did not return an authorization code. Please try again.";
  const displayError = validationError ?? errorMessage;

  useEffect(() => {
    if (validationError || !code) {
      return;
    }

    const authorizationCode = code;
    let active = true;

    async function completeLogin() {
      try {
        const response = await loginWithGoogleCode(authorizationCode);
        if (!active) {
          return;
        }

        persistAuthSession(response);
        router.replace("/main");
      } catch {
        if (active) {
          setErrorMessage("Could not complete Google login. Please try again.");
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
          Google Login
        </p>
        <h1 className="mt-3 text-xl font-black text-slate-900">
          {displayError ? "Login Failed" : "Signing You In"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {displayError ?? "Connecting your Google account to FitLog."}
        </p>
        {displayError ? (
          <button
            type="button"
            onClick={() => router.replace("/social-login")}
            className="mt-5 h-11 w-full rounded-[8px] bg-slate-900 text-sm font-bold text-white"
          >
            Try Again
          </button>
        ) : null}
      </main>
    </div>
  );
}
