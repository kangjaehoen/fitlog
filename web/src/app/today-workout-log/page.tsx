import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkoutLog } from "@/features/recording/api";
import { WorkoutLogScreen } from "@/features/recording/components/workout-log-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "운동 기록하기",
};

export default async function TodayWorkoutLogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const workoutLog = await getWorkoutLog(token);

  return <WorkoutLogScreen data={workoutLog} />;
}
