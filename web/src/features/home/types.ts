export type HomeDashboard = {
  todayRecordLabel: string;
  dateLabel: string;
  recordChips: string[];
  goalPercent: number;
  nutritionStatus: string;
  summaryCards: Array<{
    label: string;
    value: string;
    subValue?: string;
    status?: string;
  }>;
  nutritionProgress: Array<{
    label: string;
    percent: number;
    colorClass: string;
  }>;
  workout: {
    title: string;
    routine: string;
    progressLabel: string;
    duration: string;
    calories: string;
  };
  weeklySummary: Array<{
    label: string;
    value: string;
    helper: string;
    valueClass: string;
  }>;
};
