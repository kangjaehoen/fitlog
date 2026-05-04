import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getWeeklyAnalysis } from "@/features/weekly-analysis/api";
import { WeeklyAnalysisScreen } from "@/features/weekly-analysis/components/weekly-analysis-screen";

const AUTH_COOKIE_KEY = "fitlog_auth_token";

export const metadata = {
  title: "주간 통계 분석",
};

type WeeklyRecordAnalysisPageProps = {
  searchParams?: Promise<{
    weekStart?: string;
  }>;
};

export default async function WeeklyRecordAnalysisPage({
  searchParams,
}: WeeklyRecordAnalysisPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value;
  if (!token) {
    redirect("/");
  }

  const params = await searchParams;
  const analysis = await getWeeklyAnalysis(token, {
    weekStart: params?.weekStart,
  });

  return <WeeklyAnalysisScreen analysis={analysis} />;
}
