import type { HomeDashboard } from "./types";

export const homeDashboardMock: HomeDashboard = {
  todayRecordLabel: "오늘 기록",
  dateLabel: "2026년 4월 24일 (금)",
  recordChips: ["식단 3회", "운동 완료", "신체 기록"],
  goalPercent: 80,
  nutritionStatus: "79% 달성",
  summaryCards: [
    { label: "칼로리", value: "1,820", subValue: "/ 2,300 kcal" },
    { label: "단백질", value: "128", subValue: "/ 160g" },
    { label: "운동", value: "완료", status: "루틴 수행 완료" },
    { label: "체중", value: "71.2", subValue: "kg" },
  ],
  nutritionProgress: [
    { label: "칼로리", percent: 79, colorClass: "bg-[#f6bcc8]" },
    { label: "탄수화물", percent: 72, colorClass: "bg-[#b1a6fb]" },
    { label: "단백질", percent: 80, colorClass: "bg-[#8fd5ad]" },
    { label: "지방", percent: 61, colorClass: "bg-[#95d9e4]" },
  ],
  workout: {
    title: "오늘 운동",
    routine: "오늘의 루틴: 가슴 + 어깨",
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
      helper: "최근 일주일 평균 섭취",
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
      helper: "로그를 이어가는 중",
      valueClass: "text-emerald-600",
    },
  ],
};
