import { getSocialLogin, getSplash } from "@/features/account/api";
import { SplashScreen } from "@/features/account/components/splash-screen";

export default async function HomePage() {
  const [splash, socialLogin] = await Promise.all([
    getSplash(),
    getSocialLogin(),
  ]);

  return <SplashScreen data={splash} loginData={socialLogin} />;
}
