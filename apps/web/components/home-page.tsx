"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers";
import { IndiaTileMap } from "@/components/india-tile-map";
import { DataPill, LeaderCard, QuickLinkCard, SectionHeading, StatCard, TimelineCard } from "@/components/ui";
import type { DashboardResponse, NewsItem, StateRecord } from "@/lib/types";

const featuredPositionLinks = [
  { label: "President", slug: "president-of-india", description: "Head of State" },
  { label: "Prime Minister", slug: "prime-minister-of-india", description: "Head of Government" },
  { label: "Vice President", slug: "vice-president-of-india", description: "Upper House Chair" },
  { label: "Council of Ministers", slug: "union-cabinet-minister", description: "Union executive" },
  { label: "Governors", slug: "governor", description: "State constitutional heads" },
  { label: "Chief Ministers", slug: "chief-minister", description: "State executives" },
  { label: "Supreme Court Judges", slug: "supreme-court-judge", description: "Judicial leadership" },
  { label: "Armed Forces Chiefs", slug: "chief-of-defence-staff", description: "National defence command" },
  { label: "Lok Sabha", slug: "lok-sabha-speaker", description: "Lower house leadership" },
  { label: "Rajya Sabha", slug: "rajya-sabha-chairman", description: "Upper house leadership" },
  { label: "Vidhan Sabha", slug: "vidhan-sabha-speaker", description: "State assembly speakers" },
  { label: "Vidhan Parishad", slug: "vidhan-parishad-chairman", description: "Legislative councils" }
] as const;

export function HomePage({
  dashboard,
  states,
  news
}: {
  dashboard: DashboardResponse;
  states: StateRecord[];
  news: NewsItem[];
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-20 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-8 shadow-soft md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(249,115,22,0.18),transparent_25%),radial-gradient(circle_at_85%_20%,rgba(15,118,110,0.18),transparent_28%),radial-gradient(circle_at_55%_75%,rgba(245,158,11,0.12),transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              <DataPill tone="warm">{t("heroEyebrow")}</DataPill>
              <DataPill>Next.js + Express + PostgreSQL</DataPill>
              <DataPill>Responsive + Dark Mode</DataPill>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">{t("heroTitle")}</h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{t("heroSubtitle")}</p>
            </div>

            <form action="/leaders" className="flex flex-col gap-3 rounded-[1.75rem] border border-border/80 bg-white/80 p-4 shadow-card dark:bg-navy/40 sm:flex-row">
              <input
                name="search"
                placeholder={t("searchPlaceholder")}
                className="h-14 flex-1 rounded-2xl border border-border bg-transparent px-5 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground"
              />
              <button className="h-14 rounded-2xl bg-navy px-6 text-sm font-semibold text-white transition hover:bg-emerald">
                {t("search")}
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/leaders"
                className="inline-flex items-center rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-white transition hover:bg-gold"
              >
                {t("exploreLeaders")}
              </Link>
              <Link
                href="/states"
                className="inline-flex items-center rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-saffron/30 dark:bg-white/5"
              >
                {t("browseStates")}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <StatCard label="States" value={String(dashboard.stats.states)} caption="State-level executive and legislative tracking" />
            <StatCard
              label="Union Territories"
              value={String(dashboard.stats.unionTerritories)}
              caption="Lt. Governor and administrator-ready coverage"
            />
            <StatCard
              label="Tracked Profiles"
              value={String(dashboard.stats.trackedProfiles)}
              caption="Current and historical office-holder records"
            />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow={t("dashboardTitle")}
          title="National governance metrics"
          description="A fast snapshot of the institutional data currently modeled in the portal."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="States" value={String(dashboard.stats.states)} caption="State jurisdictions" />
          <StatCard label="Union Territories" value={String(dashboard.stats.unionTerritories)} caption="UT jurisdictions" />
          <StatCard label="Ministries" value={String(dashboard.stats.ministries)} caption="National ministry coverage" />
          <StatCard label="Profiles" value={String(dashboard.stats.trackedProfiles)} caption="People, former leaders, and admins" />
          <StatCard label="Live Offices" value={String(dashboard.stats.liveAppointments)} caption="Current appointments in the directory" />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow={t("quickNavTitle")}
          title="Navigate by institution or office"
          description="Jump directly into the most requested constitutional, political, judicial, defence, and legislative sections."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredPositionLinks.map((item) => (
            <QuickLinkCard
              key={item.slug}
              title={item.label}
              description={item.description}
              href={`/leaders?position=${item.slug}`}
              metadata="Open filtered directory"
            />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow={t("mapTitle")}
          title="Explore the federation visually"
          description={t("mapSubtitle")}
          action={
            <Link href="/states" className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-saffron/30">
              All states and UTs
            </Link>
          }
        />
        <IndiaTileMap states={states} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow={t("featuredLeaders")}
            title="Current constitutional and national leaders"
            description="Pinned executive, judicial, and defence office holders surfaced from the live appointments layer."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.featuredLeaders.map((item) => (
              <LeaderCard key={item.id} person={item.person} appointment={item} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeading
            eyebrow={t("newsTitle")}
            title="News and governance signals"
            description="A starter content rail ready to connect with an official or editorial government news feed."
          />
          <div className="space-y-4">
            {news.map((item) => (
              <article key={item.id} className="surface rounded-3xl border border-border/80 p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                  <DataPill tone="warm">{item.category}</DataPill>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.publishedAt}</p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow={t("timelinesTitle")}
          title="Former Presidents and Prime Ministers"
          description="Appointment history is modeled separately so the portal can surface both incumbents and institutional memory."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Former Prime Ministers</h3>
            <div className="grid gap-4">
              {dashboard.timelines.formerPrimeMinisters.map((item) => (
                <TimelineCard key={item.id} appointment={item} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Former Presidents</h3>
            <div className="grid gap-4">
              {dashboard.timelines.formerPresidents.map((item) => (
                <TimelineCard key={item.id} appointment={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
