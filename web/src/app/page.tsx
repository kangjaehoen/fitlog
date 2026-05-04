import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSocialLogin, getSplash } from "@/features/account/api";
import { SplashScreen } from "@/features/account/components/splash-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

type HomePageProps = {
  searchParams?: Promise<{
    login?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (token) {
    redirect("/main");
  }

  const [splash, socialLogin] = await Promise.all([
    getSplash(),
    getSocialLogin(),
  ]);
  const params = await searchParams;
  const loginParam = Array.isArray(params?.login)
    ? params?.login[0]
    : params?.login;

  return (
    <SplashScreen
      data={splash}
      loginData={socialLogin}
      initialShowLogin={loginParam === "1"}
    />
  );
}
