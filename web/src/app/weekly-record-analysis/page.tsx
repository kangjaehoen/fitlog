import { getWeeklyAnalysis } from "@/features/weekly-analysis/api";
import { WeeklyAnalysisScreen } from "@/features/weekly-analysis/components/weekly-analysis-screen";

export const metadata = {
  title: "주간 통계 분석",
};

export default async function WeeklyRecordAnalysisPage() {
  const analysis = await getWeeklyAnalysis();

  return <WeeklyAnalysisScreen analysis={analysis} />;
}
