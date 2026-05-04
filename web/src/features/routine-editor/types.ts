export type RoutineEditorData = {
  id?: number;
  name: string;
  days: Array<{
    key: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
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
