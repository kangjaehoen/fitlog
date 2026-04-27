import { apiClient } from "@/lib/api-client";
import { allowMockFallback, useRealApi } from "@/lib/api-mode";
import { weeklyAnalysisMock } from "./mock-data";
import type { WeeklyAnalysis } from "./types";

export async function getWeeklyAnalysis(): Promise<WeeklyAnalysis> {
  if (!useRealApi) {
    return weeklyAnalysisMock;
  }

  try {
    return await apiClient.get<WeeklyAnalysis>("/api/analytics/weekly", {
      cache: "no-store",
    });
  } catch (error) {
    if (allowMockFallback) {
      return weeklyAnalysisMock;
    }

    throw error;
  }
}
