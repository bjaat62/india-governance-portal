"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers";
import { DataPill, EmptyState, LeaderCard, SectionHeading } from "@/components/ui";
import type { Appointment, StateDetailResponse } from "@/lib/types";

function AppointmentStrip({ items, emptyMessage }: { items: Appointment[]; emptyMessage: string }) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <LeaderCard key={item.id} person={item.person} appointment={item} compact />
      ))}
    </div>
  );
}

export function StatePage({ data }: { data: StateDetailResponse }) {
  const { t } = useLocale();

  return (
    <div className="space-y-10">
      <section className="surface overflow-hidden rounded-[2rem] border border-border/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <DataPill tone="warm">{data.state.type === "STATE" ? "State" : "Union Territory"}</DataPill>
          {data.state.zone ? <DataPill>{data.state.zone}</DataPill> : null}
          {data.state.capital ? <DataPill>Capital: {data.state.capital}</DataPill> : null}
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <h1 className="font-display text-4xl text-foreground md:text-5xl">{data.state.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">{data.state.description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/leaders?state=${data.state.slug}`}
                className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald"
              >
                View all related leaders
              </Link>
              {data.state.officialWebsite ? (
                <a
                  href={data.state.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-saffron/30"
                >
                  Official portal
                </a>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assembly seats</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.state.assemblySeats ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Legislative council</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.state.councilSeats ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lok Sabha seats</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.state.lokSabhaSeats ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-white/70 p-5 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rajya Sabha seats</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{data.state.rajyaSabhaSeats ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionHeading eyebrow={t("governor")} title="Constitutional head" />
          {data.sections.governor ? (
            <LeaderCard person={data.sections.governor.person} appointment={data.sections.governor} />
          ) : (
            <EmptyState message={t("noData")} />
          )}
        </div>
        <div className="space-y-4">
          <SectionHeading eyebrow={t("chiefMinister")} title="Executive leadership" />
          {data.sections.chiefMinister ? (
            <LeaderCard person={data.sections.chiefMinister.person} appointment={data.sections.chiefMinister} />
          ) : (
            <EmptyState message={t("noData")} />
          )}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("ministers")} title="Council of Ministers" description="Current executive team records connected to the state." />
        <AppointmentStrip items={data.sections.ministers} emptyMessage={t("noData")} />
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("mlas")} title="Legislative assembly members" description="Starter dataset showing how constituency-level records surface on state pages." />
        <AppointmentStrip items={data.sections.mlas} emptyMessage={t("noData")} />
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("mps")} title="Members of Parliament" description="Lok Sabha and Rajya Sabha records associated with the state or union territory." />
        <AppointmentStrip items={data.sections.mps} emptyMessage={t("noData")} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vidhan Sabha</p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">{data.state.assemblySeats ?? 0} seats</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Speaker: {data.sections.vidhanSabhaSpeaker?.person.fullName ?? "Not available in starter dataset"}
          </p>
        </div>
        <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vidhan Parishad</p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">{data.state.councilSeats ?? 0} seats</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Chairman: {data.sections.vidhanParishadChairman?.person.fullName ?? "Not available in starter dataset"}
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("administration")} title="Administrative leadership" description="Chief secretaries and other governance operators can live alongside elected office data." />
        <AppointmentStrip items={data.sections.administrators} emptyMessage={t("noData")} />
      </section>
    </div>
  );
}
