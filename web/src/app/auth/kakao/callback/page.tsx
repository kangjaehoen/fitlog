import { Suspense } from "react";
import { KakaoCallbackScreen } from "@/features/account/components/kakao-callback-screen";

export const metadata = {
  title: "Kakao Login",
};

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<KakaoCallbackFallback />}>
      <KakaoCallbackScreen />
    </Suspense>
  );
}

function KakaoCallbackFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <main className="w-full max-w-[360px] rounded-[8px] border border-slate-100 bg-slate-50 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Kakao Login
        </p>
        <h1 className="mt-3 text-xl font-black text-slate-900">
          로그인 처리 중
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          카카오 계정을 FitLog에 연결하고 있습니다.
        </p>
      </main>
    </div>
  );
}
