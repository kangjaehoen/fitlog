import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

type LegacyScreenProps = {
  title: string;
  sourceFile: string;
  current: "home" | "routine" | "stats" | "mypage";
};

export function LegacyScreen({ title, sourceFile, current }: LegacyScreenProps) {
  const src = `/legacy-html/${sourceFile}`;

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
              Legacy Preview
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-900">{title}</h1>
          </div>
          <Link
            href={src}
            target="_blank"
            className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            새 창
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-3 py-4">
        <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
          <iframe
            src={src}
            title={title}
            className="h-[calc(100vh-150px)] w-full bg-white"
          />
        </div>
      </main>

      <BottomNav current={current} />
    </div>
  );
}
