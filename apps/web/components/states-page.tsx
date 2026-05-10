"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useLocale } from "@/components/providers";
import { DataPill, SectionHeading } from "@/components/ui";
import type { StateRecord } from "@/lib/types";

export function StatesPage({ states }: { states: StateRecord[] }) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"ALL" | "STATE" | "UNION_TERRITORY">("ALL");

  const filteredStates = useMemo(
    () =>
      states.filter((state) => {
        const matchesType = type === "ALL" ? true : state.type === type;
        const matchesSearch =
          search.length === 0 ||
          state.name.toLowerCase().includes(search.toLowerCase()) ||
          (state.capital ?? "").toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
      }),
    [search, states, type]
  );

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={t("states")}
        title="State and union territory explorer"
        description="Every jurisdiction has its own page for executive offices, legislative seats, and administrative context."
      />

      <div className="surface grid gap-4 rounded-[2rem] border border-border/80 p-6 shadow-card md:grid-cols-[1fr_220px_220px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by state or capital"
          className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value as "ALL" | "STATE" | "UNION_TERRITORY")}
          className="h-12 rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground outline-none"
        >
          <option value="ALL">All jurisdictions</option>
          <option value="STATE">States</option>
          <option value="UNION_TERRITORY">Union Territories</option>
        </select>
        <div className="flex items-center rounded-2xl border border-border bg-white/70 px-4 text-sm text-muted-foreground dark:bg-white/5">
          {filteredStates.length} results
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredStates.map((state) => (
          <Link
            key={state.id}
            href={`/states/${state.slug}`}
            className="surface rounded-[2rem] border border-border/80 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-saffron/30"
          >
            <div className="flex flex-wrap gap-2">
              <DataPill tone="warm">{state.type === "STATE" ? "State" : "Union Territory"}</DataPill>
              {state.zone ? <DataPill>{state.zone}</DataPill> : null}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-foreground">{state.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Capital: {state.capital ?? "N/A"}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-white/70 p-3 dark:bg-white/5">
                <p>Assembly</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{state.assemblySeats ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/70 p-3 dark:bg-white/5">
                <p>Lok Sabha</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{state.lokSabhaSeats ?? 0}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
