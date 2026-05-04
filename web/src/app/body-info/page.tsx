import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBodyInfoDraft } from "@/features/recording/api";
import { BodyInfoScreen } from "@/features/recording/components/body-info-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "신체 데이터 기록",
};

export default async function BodyInfoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const draft = await getBodyInfoDraft(token);

  return <BodyInfoScreen draft={draft} />;
}
