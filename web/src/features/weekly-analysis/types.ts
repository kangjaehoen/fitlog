export type WeeklyAnalysis = {
  weekLabel: string;
  dateRange: string;
  weekStart?: string;
  currentWeekStart?: string;
  totalWorkout: string;
  comparison: string;
  workoutBars: Array<{
    label: string;
    height: number;
    active?: boolean;
  }>;
  kpis: Array<{
    label: string;
    value: string;
    valueClass: string;
  }>;
  macros: Array<{
    label: string;
    value: string;
    color: string;
  }>;
  insight: string;
  weightWindow?: string;
  weightBars?: Array<{
    height: number;
  }>;
  weightStats?: Array<{
    label: string;
    value: string;
    valueClass: string;
  }>;
};
