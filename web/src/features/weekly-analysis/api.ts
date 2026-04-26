import { apiClient } from "@/lib/api-client";
import { useRealApi } from "@/lib/api-mode";
import { weeklyAnalysisMock } from "./mock-data";
import type { WeeklyAnalysis } from "./types";

export async function getWeeklyAnalysis(): Promise<WeeklyAnalysis> {
  if (!useRealApi) {
    return weeklyAnalysisMock;
  }

  return apiClient.get<WeeklyAnalysis>("/api/analytics/weekly", {
    cache: "no-store",
  });
}
