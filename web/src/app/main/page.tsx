import { getHomeDashboard } from "@/features/home/api";
import { HomeScreen } from "@/features/home/components/home-screen";

export const metadata = {
  title: "메인",
};

export default async function MainPage() {
  const dashboard = await getHomeDashboard();

  return <HomeScreen dashboard={dashboard} />;
}
