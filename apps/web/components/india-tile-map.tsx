"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataPill } from "@/components/ui";
import type { StateRecord } from "@/lib/types";

export function IndiaTileMap({ states }: { states: StateRecord[] }) {
  const [selectedSlug, setSelectedSlug] = useState(states[0]?.slug);

  const selectedState = useMemo(
    () => states.find((state) => state.slug === selectedSlug) ?? states[0],
    [selectedSlug, states]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="surface relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border/80 p-6 shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.12),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(15,118,110,0.14),transparent_25%),radial-gradient(circle_at_60%_80%,rgba(245,158,11,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:2.4rem_2.4rem]" />
        <div className="relative h-full rounded-[1.5rem] border border-white/40 bg-card/75">
          {states.map((state) => (
            <button
              key={state.id}
              type="button"
              onClick={() => setSelectedSlug(state.slug)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${state.mapX ?? 50}%`, top: `${state.mapY ?? 50}%` }}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-bold transition md:h-11 md:w-11 md:text-xs ${
                  selectedSlug === state.slug
                    ? "border-saffron bg-saffron text-white shadow-soft"
                    : "border-border bg-white/90 text-navy hover:border-saffron hover:text-saffron dark:bg-navy"
                }`}
              >
                {state.code}
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-3 py-1 text-[10px] font-medium text-white group-hover:block">
                {state.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedState ? (
        <div className="surface flex flex-col justify-between rounded-[2rem] border border-border/80 p-6 shadow-card">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DataPill tone="warm">{selectedState.type === "STATE" ? "State" : "Union Territory"}</DataPill>
              {selectedState.zone ? <DataPill>{selectedState.zone}</DataPill> : null}
            </div>
            <h3 className="mt-4 font-display text-3xl text-foreground">{selectedState.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Capital: <span className="font-medium text-foreground">{selectedState.capital ?? "N/A"}</span>
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assembly</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{selectedState.assemblySeats ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lok Sabha</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{selectedState.lokSabhaSeats ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rajya Sabha</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{selectedState.rajyaSabhaSeats ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Council</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{selectedState.councilSeats ?? 0}</p>
              </div>
            </div>
          </div>

          <Link
            href={`/states/${selectedState.slug}`}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald"
          >
            Open state profile
          </Link>
        </div>
      ) : null}
    </div>
  );
}
