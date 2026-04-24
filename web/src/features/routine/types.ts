export type RoutineOverview = {
  searchPlaceholder: string;
  sectionTitle: string;
  editLabel: string;
  createActionLabel: string;
  startActionLabel: string;
  routines: Array<{
    title: string;
    frequencyLabel: string;
    description: string;
    exerciseSummary?: string;
    duration?: string;
    tone: "indigo" | "emerald" | "orange";
    icon: "dumbbell" | "bolt";
    buttonVariant: "dark" | "muted" | "disabled";
    disabled?: boolean;
    subdued?: boolean;
  }>;
};
