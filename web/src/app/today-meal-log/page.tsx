import { LegacyScreen } from "@/components/legacy-screen";

export const metadata = {
  title: "Meal Log",
};

export default function TodayMealLogPage() {
  return (
    <LegacyScreen
      title="오늘 식단 기록"
      sourceFile="today-meal-log.html"
      current="home"
    />
  );
}
