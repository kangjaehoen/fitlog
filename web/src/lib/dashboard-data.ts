export type HomeDashboard = {
  todayRecordLabel: string;
  recordHeadline: string;
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
  weightWindow: string;
  weightBars: Array<{
    height: number;
  }>;
  weightStats: Array<{
    label: string;
    value: string;
    valueClass: string;
  }>;
};

const homeDashboard: HomeDashboard = {
  todayRecordLabel: "오늘 기록",
  recordHeadline: "기록 루틴을 이어가고 있어요",
  dateLabel: "2026년 4월 4일 (토)",
  recordChips: ["식단 3회", "운동 완료", "체중 기록"],
  goalPercent: 80,
  nutritionStatus: "79% 달성",
  summaryCards: [
    { label: "칼로리", value: "1,820", subValue: "/ 2,300 kcal" },
    { label: "단백질", value: "128", subValue: "/ 160g" },
    { label: "운동", value: "완료", status: "세션 저장됨" },
    { label: "체중", value: "71.2", subValue: "kg" },
  ],
  nutritionProgress: [
    { label: "칼로리", percent: 79, colorClass: "bg-orange-400" },
    { label: "탄수화물", percent: 72, colorClass: "bg-sky-400" },
    { label: "단백질", percent: 80, colorClass: "bg-indigo-500" },
    { label: "지방", percent: 61, colorClass: "bg-amber-400" },
  ],
  workout: {
    title: "오늘 운동",
    routine: "오늘의 루틴: 가슴 + 삼두",
    progressLabel: "3/5 완료",
    duration: "48분",
    calories: "342 kcal",
  },
  weeklySummary: [
    {
      label: "운동",
      value: "4회",
      helper: "이번 주 루틴 수행",
      valueClass: "text-slate-900",
    },
    {
      label: "평균 칼로리",
      value: "2,180 kcal",
      helper: "하루 평균 섭취",
      valueClass: "text-orange-500",
    },
    {
      label: "체중 변화",
      value: "+0.3kg",
      helper: "지난주 대비",
      valueClass: "text-rose-500",
    },
    {
      label: "연속 기록",
      value: "6일",
      helper: "로그 유지 중",
      valueClass: "text-emerald-600",
    },
  ],
};

const weeklyAnalysis: WeeklyAnalysis = {
  weekLabel: "4월 1주차",
  dateRange: "4월 1일(월) ~ 4월 7일(일)",
  totalWorkout: "총 5시간 42분 활동함",
  comparison: "지난주 대비 +15%",
  workoutBars: [
    { label: "월", height: 45 },
    { label: "화", height: 70 },
    { label: "수", height: 30 },
    { label: "목", height: 85, active: true },
    { label: "금", height: 60 },
    { label: "토", height: 25 },
    { label: "일", height: 10 },
  ],
  kpis: [
    { label: "성공한 세션", value: "12회", valueClass: "text-slate-900" },
    {
      label: "주간 소모 칼로리",
      value: "2,480 kcal",
      valueClass: "text-orange-500",
    },
  ],
  macros: [
    { label: "단백질", value: "42%", color: "#4f46e5" },
    { label: "탄수화물", value: "38%", color: "#60a5fa" },
    { label: "지방", value: "20%", color: "#f59e0b" },
  ],
  insight:
    "이번 주 단백질 섭취량이 매우 양호합니다. 주말에는 탄수화물 비율만 조금 낮춰보세요.",
  weightWindow: "최근 30일",
  weightBars: [
    { height: 64 },
    { height: 55 },
    { height: 58 },
    { height: 46 },
    { height: 38 },
    { height: 31 },
    { height: 25 },
  ],
  weightStats: [
    { label: "시작", value: "73.5kg", valueClass: "text-slate-900" },
    { label: "현재", value: "71.2kg", valueClass: "text-slate-900" },
    { label: "감량", value: "-2.3kg", valueClass: "text-indigo-600" },
  ],
};

export async function getHomeDashboard(): Promise<HomeDashboard> {
  return homeDashboard;
}

export async function getWeeklyAnalysis(): Promise<WeeklyAnalysis> {
  return weeklyAnalysis;
}
