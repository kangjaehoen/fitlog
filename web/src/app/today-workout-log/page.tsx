import { getWorkoutLog } from "@/features/recording/api";
import { WorkoutLogScreen } from "@/features/recording/components/workout-log-screen";

export const metadata = {
  title: "운동 기록하기",
};

export default async function TodayWorkoutLogPage() {
  const workoutLog = await getWorkoutLog();

  return <WorkoutLogScreen data={workoutLog} />;
}
