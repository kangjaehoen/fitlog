import Link from "next/link";
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
          {data.options.map((option) => (
            <Link
              key={option.label}
              href={option.href}
              className={`flex h-14 items-center justify-center gap-3 rounded-[16px] text-[16px] font-bold transition hover:-translate-y-0.5 ${toneStyles[option.tone]}`}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-white/70 text-sm font-black text-slate-900">
                {option.provider}
              </span>
              <span>{option.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
