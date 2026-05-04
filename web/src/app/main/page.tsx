import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getHomeDashboard } from "@/features/home/api";
import { HomeScreen } from "@/features/home/components/home-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "메인",
};

export default async function MainPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const dashboard = await getHomeDashboard(token);

  return <HomeScreen dashboard={dashboard} />;
}
