import { getSocialLogin } from "@/features/account/api";
import { SocialLoginScreen } from "@/features/account/components/social-login-screen";

export const metadata = {
  title: "소셜 로그인",
};

export default async function SocialLoginPage() {
  const data = await getSocialLogin();

  return <SocialLoginScreen data={data} />;
}
