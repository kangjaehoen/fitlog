import { BottomNav } from "@/components/navigation/bottom-nav";
import type { WeeklyAnalysis } from "../types";
import { WeeklyAnalysisHeader } from "./weekly-analysis-header";
import { WeeklyMacrosSection } from "./weekly-macros-section";
import { WeeklyWorkoutSection } from "./weekly-workout-section";

type WeeklyAnalysisScreenProps = {
  analysis: WeeklyAnalysis;
};

export function WeeklyAnalysisScreen({
  analysis,
}: WeeklyAnalysisScreenProps) {
  const currentWeekStart =
    normalizeWeekStart(analysis.currentWeekStart) ?? getCurrentWeekStart();
  const weekStart = normalizeWeekStart(analysis.weekStart) ?? currentWeekStart;
  const previousWeekStart = addDays(weekStart, -7);
  const nextWeekStart = addDays(weekStart, 7);
  const canViewNextWeek = weekStart < currentWeekStart;
  const weekLabel = formatWeekLabel(weekStart) || analysis.weekLabel;

  return (
    <div className="pb-32">
      <WeeklyAnalysisHeader
        weekLabel={weekLabel}
        dateRange={analysis.dateRange}
        previousWeekHref={weeklyAnalysisHref(previousWeekStart)}
        nextWeekHref={weeklyAnalysisHref(nextWeekStart)}
        canViewNextWeek={canViewNextWeek}
      />

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        <WeeklyWorkoutSection
          totalWorkout={analysis.totalWorkout}
          comparison={analysis.comparison}
          workoutBars={analysis.workoutBars}
          kpis={analysis.kpis}
        />
        <WeeklyMacrosSection
          macros={analysis.macros}
          insight={analysis.insight}
        />
      </main>

      <BottomNav current="stats" />
    </div>
  );
}

function weeklyAnalysisHref(weekStart: string) {
  return `/weekly-record-analysis?weekStart=${weekStart}`;
}

function addDays(dateIso: string, days: number) {
  const date = parseIsoDate(dateIso) ?? parseIsoDate(getCurrentWeekStart());
  if (!date) {
    return dateIso;
  }

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function getCurrentWeekStart() {
  const today = formatLocalDate(new Date());

  return normalizeWeekStart(today) ?? today;
}

function normalizeWeekStart(dateIso?: string) {
  if (!dateIso) {
    return null;
  }

  const date = parseIsoDate(dateIso);
  if (!date) {
    return null;
  }

  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  return date.toISOString().slice(0, 10);
}

function parseIsoDate(dateIso: string) {
  const parts = dateIso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekLabel(dateIso: string) {
  const date = parseIsoDate(dateIso);
  if (!date) {
    return "";
  }

  return `${date.getUTCMonth() + 1}월 ${mondayOrdinalInMonth(date)}주차`;
}

function mondayOrdinalInMonth(date: Date) {
  const firstMonday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  );
  while (firstMonday.getUTCDay() !== 1) {
    firstMonday.setUTCDate(firstMonday.getUTCDate() + 1);
  }

  if (date < firstMonday) {
    return 1;
  }

  return Math.floor((date.getUTCDate() - firstMonday.getUTCDate()) / 7) + 1;
}
