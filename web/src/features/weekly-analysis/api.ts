import { apiClient } from "@/lib/api-client";
import { weeklyAnalysisMock } from "./mock-data";
import type { WeeklyAnalysis } from "./types";

const useRealApi = process.env.FITLOG_USE_REAL_API === "true";

export async function getWeeklyAnalysis(): Promise<WeeklyAnalysis> {
  if (!useRealApi) {
    return weeklyAnalysisMock;
  }

  return apiClient.get<WeeklyAnalysis>("/api/analytics/weekly", {
    cache: "no-store",
  });
}
