import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoutineOverview } from "@/features/routine/api";
import { RoutineScreen } from "@/features/routine/components/routine-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "운동 루틴",
};

type FitnessRoutinePageProps = {
  searchParams?: Promise<{
    source?: string | string[];
  }>;
};

export default async function FitnessRoutinePage({
  searchParams,
}: FitnessRoutinePageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const params = await searchParams;
  const source = Array.isArray(params?.source)
    ? params?.source[0]
    : params?.source;
  const overview = await getRoutineOverview(token);

  return (
    <RoutineScreen
      overview={overview}
      presentation={source === "workout-log" ? "stack" : "tab"}
    />
  );
}
