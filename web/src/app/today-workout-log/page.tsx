import { LegacyScreen } from "@/components/legacy/legacy-screen";

export const metadata = {
  title: "Workout Log",
};

export default function TodayWorkoutLogPage() {
  return (
    <LegacyScreen
      title="오늘 운동 기록"
      sourceFile="today-workout-log.html"
      current="home"
    />
  );
}
