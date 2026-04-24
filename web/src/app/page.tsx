import { getHomeDashboard } from "@/features/home/api";
import { HomeScreen } from "@/features/home/components/home-screen";

export default async function HomePage() {
  const dashboard = await getHomeDashboard();

  return <HomeScreen dashboard={dashboard} />;
}
