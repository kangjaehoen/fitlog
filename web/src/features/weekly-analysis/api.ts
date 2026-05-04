import { apiClient } from "@/lib/api-client";
import type { WeeklyAnalysis } from "./types";

type WeeklyAnalysisParams = {
  weekStart?: string;
};

export async function getWeeklyAnalysis(
  token?: string,
  params: WeeklyAnalysisParams = {},
): Promise<WeeklyAnalysis> {
  const searchParams = new URLSearchParams();
  if (params.weekStart) {
    searchParams.set("weekStart", params.weekStart);
  }

  const query = searchParams.toString();

  const analysis = await apiClient.get<WeeklyAnalysis>(`/api/analytics/weekly${query ? `?${query}` : ""}`, {
    cache: "no-store",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const currentWeekStart = analysis.currentWeekStart ?? getCurrentWeekStart();

  return {
    ...analysis,
    weekStart: analysis.weekStart ?? normalizeWeekStart(params.weekStart ?? currentWeekStart),
    currentWeekStart,
  };
}

function normalizeWeekStart(dateIso: string): string {
  const date = parseIsoDate(dateIso);
  if (!date) {
    return getCurrentWeekStart();
  }

  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  return formatIsoDate(date);
}

function getCurrentWeekStart(): string {
  return normalizeWeekStart(formatIsoDate(new Date()));
}

function parseIsoDate(dateIso: string): Date | null {
  const parts = dateIso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
