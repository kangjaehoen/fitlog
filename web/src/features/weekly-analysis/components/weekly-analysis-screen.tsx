import { BottomNav } from "@/components/navigation/bottom-nav";
import type { WeeklyAnalysis } from "../types";
import { WeeklyAnalysisHeader } from "./weekly-analysis-header";
import { WeeklyMacrosSection } from "./weekly-macros-section";
import { WeeklyWorkoutSection } from "./weekly-workout-section";

type WeeklyAnalysisScreenProps = {
  analysis: WeeklyAnalysis;
};

export function WeeklyAnalysisScreen({
  analysis,
}: WeeklyAnalysisScreenProps) {
  return (
    <div className="pb-32">
      <WeeklyAnalysisHeader
        weekLabel={analysis.weekLabel}
        dateRange={analysis.dateRange}
      />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        <WeeklyWorkoutSection
          totalWorkout={analysis.totalWorkout}
          comparison={analysis.comparison}
          workoutBars={analysis.workoutBars}
          kpis={analysis.kpis}
        />
        <WeeklyMacrosSection
          macros={analysis.macros}
          insight={analysis.insight}
        />
      </main>

      <BottomNav current="stats" />
    </div>
  );
}
