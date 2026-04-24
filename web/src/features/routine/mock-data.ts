import type { RoutineOverview } from "./types";

export const routineOverviewMock: RoutineOverview = {
  searchPlaceholder: "루틴 이름 검색",
  sectionTitle: "나의 활성 루틴 (3)",
  editLabel: "편집",
  createActionLabel: "맞춤형 루틴 만들기",
  startActionLabel: "이 루틴으로 시작하기",
  routines: [
    {
      title: "상체 벌크업 A",
      frequencyLabel: "주 3회",
      description: "가슴, 어깨, 삼두 위주 집중 루틴",
      exerciseSummary: "6개 운동 구성",
      duration: "약 65분 소모",
      tone: "indigo",
      icon: "dumbbell",
      buttonVariant: "dark",
    },
    {
      title: "하체 및 코어 데이",
      frequencyLabel: "주 2회",
      description: "스쿼트 중심의 하체 근력 강화",
      exerciseSummary: "5개 운동 구성",
      duration: "약 50분 소모",
      tone: "emerald",
      icon: "bolt",
      buttonVariant: "muted",
    },
    {
      title: "주말 유산소",
      frequencyLabel: "주 1회",
      description: "지구력 강화 및 칼로리 소모",
      tone: "orange",
      icon: "bolt",
      buttonVariant: "disabled",
      disabled: true,
      subdued: true,
    },
  ],
};
