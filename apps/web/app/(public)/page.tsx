import { HomePage } from "@/components/home-page";
import { getDashboard, getNews, getStates } from "@/lib/api";

export default async function HomeRoute() {
  const [dashboard, states, news] = await Promise.all([getDashboard(), getStates(), getNews()]);

  return <HomePage dashboard={dashboard} states={states} news={news} />;
}
