import { apiClient } from "@/lib/api-client";
import type { HomeDashboard } from "./types";

export async function getHomeDashboard(token?: string): Promise<HomeDashboard> {
  return apiClient.get<HomeDashboard>("/api/home/dashboard", {
    cache: "no-store",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}
