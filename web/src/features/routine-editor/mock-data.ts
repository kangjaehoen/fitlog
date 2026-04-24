import type { RoutineEditorData } from "./types";

export const routineEditorMock: RoutineEditorData = {
  name: "상체 벌크업 A",
  saveActionLabel: "저장하기",
  insight:
    "대근육(가슴 같은 복합 운동)을 먼저 배치하면 후반 세트 퍼포먼스를 조금 더 안정적으로 가져가기 좋아요.",
  days: [
    { key: "sun", label: "일", active: false },
    { key: "mon", label: "월", active: true },
    { key: "tue", label: "화", active: false },
    { key: "wed", label: "수", active: true },
    { key: "thu", label: "목", active: false },
    { key: "fri", label: "금", active: true },
    { key: "sat", label: "토", active: false },
  ],
  exercises: [
    {
      name: "벤치프레스",
      group: "가슴",
      sets: [
        { weight: 60, reps: 12 },
        { weight: 60, reps: 10 },
      ],
    },
    {
      name: "숄더프레스",
      group: "어깨",
      sets: [
        { weight: 24, reps: 12 },
        { weight: 24, reps: 10 },
      ],
    },
  ],
};
