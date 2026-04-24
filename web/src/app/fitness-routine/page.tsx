import { getRoutineOverview } from "@/features/routine/api";
import { RoutineScreen } from "@/features/routine/components/routine-screen";

export const metadata = {
  title: "운동 루틴",
};

export default async function FitnessRoutinePage() {
  const overview = await getRoutineOverview();

  return <RoutineScreen overview={overview} />;
}
