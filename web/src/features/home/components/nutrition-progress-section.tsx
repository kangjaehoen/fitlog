import type { HomeDashboard } from "../types";
import { ProgressRow } from "./progress-row";

type NutritionProgressSectionProps = {
  nutritionProgress: HomeDashboard["nutritionProgress"];
};

export function NutritionProgressSection({
  nutritionProgress,
}: NutritionProgressSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#c7d2fe] bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-[8px]">
      <div className="mb-6">
        <h2 className="text-[18px] font-black leading-none text-slate-900">
          오늘 식단 현황
        </h2>
      </div>

      <div className="space-y-4">
        {nutritionProgress.map((item) => (
          <ProgressRow
            key={item.label}
            label={item.label}
            percent={item.percent}
            colorClass={item.colorClass}
          />
        ))}
      </div>
    </section>
  );
}
