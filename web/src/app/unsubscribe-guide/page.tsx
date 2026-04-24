import { getUnsubscribeGuide } from "@/features/account/api";
import { UnsubscribeScreen } from "@/features/account/components/unsubscribe-screen";

export const metadata = {
  title: "서비스 탈퇴",
};

export default async function UnsubscribeGuidePage() {
  const data = await getUnsubscribeGuide();

  return <UnsubscribeScreen data={data} />;
}
