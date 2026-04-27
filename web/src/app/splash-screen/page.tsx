import { getSocialLogin, getSplash } from "@/features/account/api";
import { SplashScreen } from "@/features/account/components/splash-screen";

export const metadata = {
  title: "스플래시",
};

export default async function SplashPage() {
  const [data, loginData] = await Promise.all([
    getSplash(),
    getSocialLogin(),
  ]);

  return <SplashScreen data={data} loginData={loginData} />;
}
