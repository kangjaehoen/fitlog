import { Suspense } from "react";
import { GoogleCallbackScreen } from "@/features/account/components/google-callback-screen";

export const metadata = {
  title: "Google Login",
};

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackFallback />}>
      <GoogleCallbackScreen />
    </Suspense>
  );
}

function GoogleCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <main className="w-full max-w-[360px] rounded-[8px] border border-slate-100 bg-slate-50 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Google Login
        </p>
        <h1 className="mt-3 text-xl font-black text-slate-900">
          Signing You In
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Connecting your Google account to FitLog.
        </p>
      </main>
    </div>
  );
}
