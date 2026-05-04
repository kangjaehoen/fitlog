import { getSocialLogin, getSplash } from "@/features/account/api";
import { SplashScreen } from "@/features/account/components/splash-screen";

export const metadata = {
  title: "스플래시",
};

type SplashPageProps = {
  searchParams?: Promise<{
    login?: string | string[];
  }>;
};

export default async function SplashPage({ searchParams }: SplashPageProps) {
  const [data, loginData] = await Promise.all([
    getSplash(),
    getSocialLogin(),
  ]);
  const params = await searchParams;
  const loginParam = Array.isArray(params?.login)
    ? params?.login[0]
    : params?.login;

  return (
    <SplashScreen
      data={data}
      loginData={loginData}
      initialShowLogin={loginParam === "1"}
    />
  );
}
