import { getMealLog } from "@/features/recording/api";
import { MealLogScreen } from "@/features/recording/components/meal-log-screen";

export const metadata = {
  title: "식단 기록",
};

export default async function TodayMealLogPage() {
  const mealLog = await getMealLog();

  return <MealLogScreen data={mealLog} />;
}
