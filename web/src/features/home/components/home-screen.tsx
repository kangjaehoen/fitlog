import { BottomNav } from "@/components/navigation/bottom-nav";
import type { HomeDashboard } from "../types";
import { DailySummarySection } from "./daily-summary-section";
import { HomeHeader } from "./home-header";
import { NutritionProgressSection } from "./nutrition-progress-section";
import { QuickActions } from "./quick-actions";
import { RecordOverviewCard } from "./record-overview-card";
import { WorkoutFocusSection } from "./workout-focus-section";

type HomeScreenProps = {
  dashboard: HomeDashboard;
};

export function HomeScreen({ dashboard }: HomeScreenProps) {
  return (
    <div className="pb-40">
      <HomeHeader />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        <RecordOverviewCard
          dateLabel={dashboard.dateLabel}
          recordChips={dashboard.recordChips}
        />
        <DailySummarySection
          dateLabel={dashboard.dateLabel}
          summaryCards={dashboard.summaryCards}
        />
        <NutritionProgressSection
          nutritionProgress={dashboard.nutritionProgress}
        />
        <WorkoutFocusSection workout={dashboard.workout} />
      </main>

      <QuickActions />
      <BottomNav current="home" />
    </div>
  );
}
