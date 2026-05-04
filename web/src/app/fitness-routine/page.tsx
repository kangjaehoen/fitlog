import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoutineOverview } from "@/features/routine/api";
import { RoutineScreen } from "@/features/routine/components/routine-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "운동 루틴",
};

export default async function FitnessRoutinePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const overview = await getRoutineOverview(token);

  return <RoutineScreen overview={overview} />;
}
