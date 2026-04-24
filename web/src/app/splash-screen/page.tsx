import { getSplash } from "@/features/account/api";
import { SplashScreen } from "@/features/account/components/splash-screen";

export const metadata = {
  title: "스플래시",
};

export default async function SplashPage() {
  const data = await getSplash();

  return <SplashScreen data={data} />;
}
