import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWorkoutLog } from "@/features/recording/api";
import { WorkoutLogScreen } from "@/features/recording/components/workout-log-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "운동 기록하기",
};

type TodayWorkoutLogPageProps = {
  searchParams?: Promise<{
    routineId?: string | string[];
  }>;
};

export default async function TodayWorkoutLogPage({
  searchParams,
}: TodayWorkoutLogPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const params = await searchParams;
  const routineIdParam = Array.isArray(params?.routineId)
    ? params?.routineId[0]
    : params?.routineId;
  const routineId = routineIdParam ? Number(routineIdParam) : undefined;
  const workoutLog = await getWorkoutLog(
    token,
    Number.isFinite(routineId) ? routineId : undefined,
  );

  return <WorkoutLogScreen key={workoutLog.routineId ?? "draft"} data={workoutLog} />;
}
