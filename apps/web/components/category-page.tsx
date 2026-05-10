"use client";

import { useLocale } from "@/components/providers";
import { DataPill, EmptyState, LeaderCard, QuickLinkCard, SectionHeading } from "@/components/ui";
import type { DirectoryResponse, Position } from "@/lib/types";

export function CategoryPage({
  slug,
  directory,
  positions
}: {
  slug: string;
  directory: DirectoryResponse;
  positions: Position[];
}) {
  const { t } = useLocale();
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow={title}
        title={`${title} leadership and offices`}
        description={`Browse all positions and people currently mapped to the ${title.toLowerCase()} governance category.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickLinkCard
          title="Active Profiles"
          description="Current people with appointments in this category."
          href={`/leaders?category=${slug}`}
          metadata={`${directory.total} results`}
        />
        <QuickLinkCard
          title="Office Types"
          description="Distinct roles configured for this category."
          href={`/leaders?category=${slug}`}
          metadata={`${positions.length} positions`}
        />
        <QuickLinkCard
          title="National Routing"
          description="API-first pages designed for dashboard, search, and SEO coverage."
          href="/"
          metadata="Server + client rendering"
        />
        <QuickLinkCard
          title="Admin Ready"
          description="Roles, appointments, and photos can be managed from the secure dashboard."
          href="/admin/login"
          metadata="JWT-protected"
        />
      </div>

      <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
        <div className="flex flex-wrap gap-2">
          {positions.map((position) => (
            <DataPill key={position.id}>{position.name}</DataPill>
          ))}
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
