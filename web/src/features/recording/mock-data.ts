import type { BodyInfoDraft, MealLogData, WorkoutLogData } from "./types";

export const bodyInfoDraftMock: BodyInfoDraft = {
  dateLabel: "2026년 4월 24일 (오늘)",
  primaryActionLabel: "저장하기",
  metrics: [
    {
      key: "weight",
      label: "몸무게",
      unit: "kg",
      min: 40,
      max: 150,
      step: 0.1,
      value: 74.2,
      color: "#4f46e5",
      helper: "이번 주 평균보다 0.4kg 낮아요.",
    },
    {
      key: "muscle",
      label: "골격근량",
      unit: "kg",
      min: 10,
      max: 70,
      step: 0.1,
      value: 36.5,
      color: "#059669",
      helper: "최근 5회 기록 중 가장 높은 수치예요.",
    },
    {
      key: "fat",
      label: "체지방률",
      unit: "%",
      min: 3,
      max: 50,
      step: 0.1,
      value: 16.8,
      color: "#e11d48",
      helper: "목표 범위까지 1.8% 남았습니다.",
    },
  ],
};

export const mealLogMock: MealLogData = {
  goalCalories: 2100,
  searchPlaceholder: "어떤 음식을 드셨나요?",
  primaryActionLabel: "오늘 식단에 추가",
  finishActionLabel: "전체 기록 완료하기",
  mealTypes: ["아침", "점심", "저녁", "간식"],
  unitOptions: [
    { key: "serving", label: "1회분" },
    { key: "gram", label: "그램(g)" },
  ],
  defaultFoodName: "닭가슴살 샐러드",
  defaultServingAmount: 1,
  estimatedCaloriesPerServing: 280,
  records: [
    {
      mealType: "아침",
      time: "08:30",
      title: "오트밀 요거트 볼",
      amount: "1.5회분",
      calories: 420,
    },
    {
      mealType: "점심",
      time: "12:45",
      title: "베이컨 치즈 버거 세트",
      amount: "1회분",
      calories: 820,
      cheating: true,
    },
  ],
};

export const workoutLogMock: WorkoutLogData = {
  initialDurationSeconds: 45 * 60 + 12,
  sessionLabel: "Workout Session",
  searchPlaceholder: "운동 종목 검색 (예: 벤치프레스)",
  routineActionLabel: "루틴 불러오기",
  addActionLabel: "운동 추가 및 리스트 저장",
  finishActionLabel: "오늘 운동 전체 종료",
  intensityOptions: ["쉬움", "적당함", "매우 힘듦"],
  exerciseName: "벤치프레스",
  routineTemplate: [
    { weight: 60, reps: 12, done: true },
    { weight: 60, reps: 10 },
  ],
  completedExercises: [
    {
      title: "벤치프레스",
      summary: "5세트 · 총 3,200kg 볼륨",
      time: "12:30",
      calories: 210,
      icon: "strength",
    },
    {
      title: "인클라인 러닝머신",
      summary: "25분 · 4.2km",
      time: "13:10",
      calories: 170,
      icon: "cardio",
    },
  ],
};
