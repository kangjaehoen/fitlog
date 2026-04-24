import { SparklesIcon } from "@/components/icons";
import type { WeeklyAnalysis } from "../types";

type WeeklyMacrosSectionProps = {
  macros: WeeklyAnalysis["macros"];
  insight: string;
};

export function WeeklyMacrosSection({
  macros,
  insight,
}: WeeklyMacrosSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="text-lg font-black text-slate-900">주간 영양 성분 비율</h2>
      <div className="mt-5 flex items-center gap-6">
        <div
          className="relative grid size-28 place-items-center rounded-full"
          style={{
            background:
              "conic-gradient(#4f46e5 0 42%, #60a5fa 42% 80%, #f59e0b 80% 100%)",
          }}
        >
          <div className="grid size-18 place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-[10px] font-medium text-slate-400">상태</p>
              <p className="text-xs font-black text-slate-700">안정</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {macros.map((macro) => (
            <div
              key={macro.label}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: macro.color }}
                />
                <span className="font-medium text-slate-500">{macro.label}</span>
              </div>
              <span className="font-black text-slate-900">{macro.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-indigo-100 bg-indigo-50 px-4 py-4 text-sm leading-relaxed text-indigo-900">
        <p className="inline-flex items-start gap-2">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-indigo-500" />
          <span>
            <strong>AI 분석:</strong> {insight}
          </span>
        </p>
      </div>
    </section>
  );
}
