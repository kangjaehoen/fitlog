import { getBodyInfoDraft } from "@/features/recording/api";
import { BodyInfoScreen } from "@/features/recording/components/body-info-screen";

export const metadata = {
  title: "신체 데이터 기록",
};

export default async function BodyInfoPage() {
  const draft = await getBodyInfoDraft();

  return <BodyInfoScreen draft={draft} />;
}
