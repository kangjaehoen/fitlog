import { UtensilsIcon } from "@/components/icons";
import type { HomeDashboard } from "../types";
import { ProgressRow } from "./progress-row";

type NutritionProgressSectionProps = {
  nutritionProgress: HomeDashboard["nutritionProgress"];
};

export function NutritionProgressSection({
  nutritionProgress,
}: NutritionProgressSectionProps) {
  return (
    <section className="rounded-[14px] border border-[#edf0ff] bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(37,45,100,0.08)]">
      <div className="mb-4 inline-flex items-center gap-1.5">
        <span className="grid size-4 place-items-center rounded-full bg-[#7563f1] text-white">
          <UtensilsIcon className="size-2.5" />
        </span>
        <h2 className="text-[13px] font-black leading-none text-[#22243d]">
          오늘 식단 현황
        </h2>
      </div>

      <div className="space-y-3">
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
