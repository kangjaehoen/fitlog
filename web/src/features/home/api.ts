import { apiClient } from "@/lib/api-client";
import { homeDashboardMock } from "./mock-data";
import type { HomeDashboard } from "./types";

const useRealApi = process.env.FITLOG_USE_REAL_API === "true";

export async function getHomeDashboard(): Promise<HomeDashboard> {
  if (!useRealApi) {
    return homeDashboardMock;
  }

  return apiClient.get<HomeDashboard>("/api/home/dashboard", {
    cache: "no-store",
  });
}
