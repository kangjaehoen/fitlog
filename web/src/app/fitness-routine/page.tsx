import { LegacyScreen } from "@/components/legacy/legacy-screen";

export const metadata = {
  title: "Routine",
};

export default function FitnessRoutinePage() {
  return (
    <LegacyScreen
      title="운동 루틴"
      sourceFile="fitness-routine.html"
      current="routine"
    />
  );
}
