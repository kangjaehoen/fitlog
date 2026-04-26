export type WeeklyAnalysis = {
  weekLabel: string;
  dateRange: string;
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
};
