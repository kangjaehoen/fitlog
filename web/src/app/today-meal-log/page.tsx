import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMealLog } from "@/features/recording/api";
import { MealLogScreen } from "@/features/recording/components/meal-log-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "식단 기록",
};

export default async function TodayMealLogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const mealLog = await getMealLog(token);

  return <MealLogScreen data={mealLog} />;
}
