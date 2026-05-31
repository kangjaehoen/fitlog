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
  unreadNotificationCount: number;
};

export function HomeScreen({
  dashboard,
  unreadNotificationCount,
}: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-[#f8f8ff] pb-[164px]">
      <HomeHeader hasUnreadNotifications={unreadNotificationCount > 0} />

      <main className="mx-auto flex w-full max-w-[390px] flex-col gap-3 px-4 pb-4 pt-2">
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
