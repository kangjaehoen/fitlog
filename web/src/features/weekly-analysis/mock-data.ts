import type { WeeklyAnalysis } from "./types";

export const weeklyAnalysisMock: WeeklyAnalysis = {
  weekLabel: "4월 1주차",
  dateRange: "4월 1일 월요일 ~ 4월 7일 일요일",
  totalWorkout: "총 5시간 42분 운동했어요.",
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
    "이번 주 단백질 섭취량이 매우 좋습니다. 주말에는 탄수화물 비율만 조금 더 올려보세요.",
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
