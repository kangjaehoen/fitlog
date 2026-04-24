export type BodyMetricKey = "weight" | "muscle" | "fat";

export type BodyInfoDraft = {
  dateLabel: string;
  primaryActionLabel: string;
  metrics: Array<{
    key: BodyMetricKey;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    value: number;
    color: string;
    helper: string;
  }>;
};

export type MealLogData = {
  goalCalories: number;
  searchPlaceholder: string;
  primaryActionLabel: string;
  finishActionLabel: string;
  mealTypes: string[];
  unitOptions: Array<{
    key: "serving" | "gram";
    label: string;
  }>;
  defaultFoodName: string;
  defaultServingAmount: number;
  estimatedCaloriesPerServing: number;
  records: Array<{
    mealType: string;
    time: string;
    title: string;
    amount: string;
    calories: number;
    cheating?: boolean;
  }>;
};

export type WorkoutLogData = {
  initialDurationSeconds: number;
  sessionLabel: string;
  searchPlaceholder: string;
  routineActionLabel: string;
  addActionLabel: string;
  finishActionLabel: string;
  intensityOptions: string[];
  exerciseName: string;
  routineTemplate: Array<{
    weight: number;
    reps: number;
    done?: boolean;
  }>;
  completedExercises: Array<{
    title: string;
    summary: string;
    time: string;
    calories: number;
    icon: "strength" | "cardio";
  }>;
};
