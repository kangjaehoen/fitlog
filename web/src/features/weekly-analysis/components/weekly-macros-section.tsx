import { LeafIcon, PieChartIcon, SparklesIcon } from "@/components/icons";
import type { WeeklyAnalysis } from "../types";

type WeeklyMacrosSectionProps = {
  macros: WeeklyAnalysis["macros"];
  insight: string;
};

type MacroItem = WeeklyAnalysis["macros"][number];
type DecoratedMacro = MacroItem & {
  color: string;
};

const macroOrder = ["탄수화물", "단백질", "지방"];
const macroColors: Record<string, string> = {
  탄수화물: "#9b5cf6",
  단백질: "#e879c6",
  지방: "#8b94f7",
};

function parsePercent(value: string) {
  const numericValue = Number(value.replace("%", "").trim());

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, numericValue);
}

function buildDonutGradient(macros: DecoratedMacro[]) {
  const values = macros.map((macro) => parsePercent(macro.value));
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return "#ede9fe";
  }

  let start = 0;
  const stops = macros.map((macro, index) => {
    const ratio = values[index] / total;
    const end = index === macros.length - 1 ? 100 : start + ratio * 100;
    const stop = `${macro.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    start = end;

    return stop;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function WeeklyMacrosSection({
  macros,
  insight,
}: WeeklyMacrosSectionProps) {
  const decoratedMacros = decorateMacros(macros);
  const donutBackground = buildDonutGradient(decoratedMacros);

  return (
    <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
      <div className="mb-4 inline-flex items-center gap-1.5">
        <span className="grid size-5 place-items-center rounded-full bg-[#7563f1] text-white">
          <PieChartIcon className="size-3.5" />
        </span>
        <h2 className="text-[13px] font-black leading-none text-[#22243d]">
          주간 영양 성분 비율
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="relative grid size-[92px] shrink-0 place-items-center rounded-full shadow-[0_12px_28px_rgba(139,92,246,0.16)]"
          style={{ background: donutBackground }}
        >
          <div className="grid size-[52px] place-items-center rounded-full bg-white text-violet-200 shadow-inner shadow-violet-100">
            <LeafIcon className="size-7" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {decoratedMacros.map((macro, index) => (
            <div
              key={macro.label}
              className={`flex items-center justify-between gap-2 py-2 text-[12px] ${
                index < decoratedMacros.length - 1
                  ? "border-b border-violet-100"
                  : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full shadow-sm"
                  style={{ backgroundColor: macro.color }}
                />
                <span className="truncate font-bold text-[#22243d]">
                  {macro.label}
                </span>
              </div>
              <span className="shrink-0 text-[14px] font-black text-[#6653e9]">
                {macro.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[10px] border border-[#eef0f8] bg-[#f7f5ff] px-3 py-3 shadow-[0_8px_20px_rgba(45,50,92,0.04)]">
        <p className="flex items-start gap-2 text-[12px] font-medium leading-relaxed text-[#22243d]">
          <SparklesIcon className="mt-0.5 size-4 shrink-0 text-[#6653e9]" />
          <span>{insight}</span>
        </p>
      </div>
    </section>
  );
}

function decorateMacros(macros: MacroItem[]) {
  return [...macros]
    .sort((first, second) => macroRank(first.label) - macroRank(second.label))
    .map((macro, index) => ({
      ...macro,
      color: macroColors[macro.label] ?? macro.color ?? fallbackMacroColor(index),
    }));
}

function macroRank(label: string) {
  const index = macroOrder.indexOf(label);

  return index === -1 ? macroOrder.length : index;
}

function fallbackMacroColor(index: number) {
  return ["#9b5cf6", "#e879c6", "#8b94f7"][index % 3];
}
