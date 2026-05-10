import { DirectoryPage } from "@/components/directory-page";
import { getLeaders, getMeta } from "@/lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LeadersRoute({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = {
    search: getValue(params.search),
    state: getValue(params.state),
    position: getValue(params.position),
    party: getValue(params.party),
    ministry: getValue(params.ministry),
    category: getValue(params.category)
  };

  const [directory, meta] = await Promise.all([getLeaders(filters), getMeta()]);

  return <DirectoryPage directory={directory} meta={meta} initialFilters={filters} />;
}
