"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLocale } from "@/components/providers";
import { EmptyState, LeaderCard, SectionHeading } from "@/components/ui";
import type { DirectoryResponse, MetaResponse } from "@/lib/types";

type FilterParams = {
  search?: string;
  state?: string;
  position?: string;
  party?: string;
  ministry?: string;
  category?: string;
};

export function DirectoryPage({
  directory,
  meta,
  initialFilters
}: {
  directory: DirectoryResponse;
  meta: MetaResponse;
  initialFilters: FilterParams;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [filters, setFilters] = useState<FilterParams>(initialFilters);

  function submitFilters() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/leaders${params.toString() ? `?${params}` : ""}`);
  }

  function resetFilters() {
    setFilters({});
    router.push("/leaders");
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t("filtersTitle")}
        title="Leadership directory"
        description="Filter by state, position, party, ministry, and category to move from national institutions to local governance in a few clicks."
      />

      <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            value={filters.search ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder={t("searchPlaceholder")}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          />
          <select
            value={filters.state ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="">All states</option>
            {meta.states.map((state) => (
              <option key={state.id} value={state.slug}>
                {state.name}
              </option>
            ))}
          </select>
          <select
            value={filters.position ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, position: event.target.value }))}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="">All positions</option>
            {meta.positions.map((position) => (
              <option key={position.id} value={position.slug}>
                {position.name}
              </option>
            ))}
          </select>
          <select
            value={filters.party ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, party: event.target.value }))}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="">All parties</option>
            {meta.parties.map((party) => (
              <option key={party.id} value={party.slug}>
                {party.name}
              </option>
            ))}
          </select>
          <select
            value={filters.ministry ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, ministry: event.target.value }))}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="">All ministries</option>
            {meta.ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.slug}>
                {ministry.name}
              </option>
            ))}
          </select>
          <select
            value={filters.category ?? ""}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
          >
            <option value="">All categories</option>
            <option value="constitutional">Constitutional</option>
            <option value="political">Political</option>
            <option value="judicial">Judicial</option>
            <option value="defence">Defence</option>
            <option value="legislative">Legislative</option>
            <option value="administrative">Administrative</option>
          </select>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submitFilters}
            className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-saffron/30"
          >
            {t("clearFilters")}
          </button>
          <div className="ml-auto rounded-full border border-border bg-white/70 px-4 py-3 text-sm text-muted-foreground dark:bg-white/5">
            {directory.total} profiles found
          </div>
        </div>
      </div>

      {directory.people.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {directory.people.map((person) => (
            <LeaderCard key={person.id} person={person} appointment={person.appointments[0]} />
          ))}
        </div>
      ) : (
        <EmptyState message={t("noData")} />
      )}
    </div>
  );
}
