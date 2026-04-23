import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

type PlaceholderProps = {
  title: string;
  description: string;
  sourceFile: string;
  current: "home" | "routine" | "stats" | "mypage";
};

export function LegacyPlaceholder({
  title,
  description,
  sourceFile,
  current,
}: PlaceholderProps) {
  return (
    <div className="pb-32">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-8">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-500">
            Migration Queue
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

          <div className="mt-5 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Legacy source</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
              legacy-html/{sourceFile}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
            >
              홈으로 이동
            </Link>
            <Link
              href="/weekly-record-analysis"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              통계 화면 보기
            </Link>
          </div>
        </section>
      </main>

      <BottomNav current={current} />
    </div>
  );
}
