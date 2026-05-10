import { StatesPage } from "@/components/states-page";
import { getStates } from "@/lib/api";

export default async function StatesRoute() {
  const states = await getStates();
  return <StatesPage states={states} />;
}
