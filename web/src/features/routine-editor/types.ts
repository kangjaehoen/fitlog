export type RoutineEditorData = {
  name: string;
  saveActionLabel: string;
  insight: string;
  days: Array<{
    key: string;
    label: string;
    active: boolean;
  }>;
  exercises: Array<{
    name: string;
    group: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
  }>;
};
