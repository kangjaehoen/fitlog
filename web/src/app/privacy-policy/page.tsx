import { getPrivacyPolicy } from "@/features/account/api";
import { PrivacyPolicyScreen } from "@/features/account/components/privacy-policy-screen";

export const metadata = {
  title: "개인정보 처리방침",
};

export default async function PrivacyPolicyPage() {
  const data = await getPrivacyPolicy();

  return <PrivacyPolicyScreen data={data} />;
}
