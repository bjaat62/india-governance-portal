import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

import { categoryLabels } from "@/lib/i18n";
import { resolveAssetUrl } from "@/lib/api";
import type { Appointment, PersonSummary } from "@/lib/types";

export function formatDate(value?: string | null) {
  if (!value) {
    return "Present";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateRange(startDate: string, endDate?: string | null) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatCategory(category: string) {
  return categoryLabels[category] ?? category;
}

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-saffron">{eyebrow}</p>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">{title}</h2>
        {description ? <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  caption
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="surface group relative overflow-hidden rounded-3xl border border-border/70 p-6 shadow-card transition duration-300 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-saffron via-gold to-emerald opacity-80" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
    </div>
  );
}

export function DataPill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warm" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "warm"
          ? "border-saffron/25 bg-saffron/10 text-saffron dark:border-saffron/30"
          : "border-border bg-white/70 text-muted-foreground dark:bg-white/5"
      )}
    >
      {children}
    </span>
  );
}

export function LeaderCard({
  person,
  appointment,
  compact = false
}: {
  person: PersonSummary;
  appointment?: Appointment;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/people/${person.slug}`}
      className="surface group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="flex items-start gap-4">
        <img
          src={resolveAssetUrl(person.photoUrl)}
          alt={person.fullName}
          className={cn(
            "rounded-2xl border border-border/80 object-cover",
            compact ? "h-16 w-16" : "h-20 w-20"
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-foreground">{person.fullName}</p>
          <p className="mt-1 text-sm text-saffron">
            {appointment?.titleOverride ?? appointment?.position.name ?? "Public office profile"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.politicalParty?.abbreviation ? <DataPill>{person.politicalParty.abbreviation}</DataPill> : null}
            {appointment?.state?.code ? <DataPill>{appointment.state.code}</DataPill> : null}
            {appointment?.ministry?.shortName ? <DataPill>{appointment.ministry.shortName}</DataPill> : null}
          </div>
        </div>
      </div>
      {!compact && person.biography ? (
        <p className="mt-4 max-h-[4.8rem] overflow-hidden text-sm leading-6 text-muted-foreground">{person.biography}</p>
      ) : null}
    </Link>
  );
}

export function QuickLinkCard({
  title,
  description,
  href,
  metadata
}: {
  title: string;
  description: string;
  href: string;
  metadata: string;
}) {
  return (
    <Link
      href={href}
      className="surface group relative overflow-hidden rounded-3xl border border-border/70 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-saffron/30"
    >
      <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-gradient-to-br from-saffron/20 to-emerald/20 blur-xl transition duration-300 group-hover:scale-125" />
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">{metadata}</p>
    </Link>
  );
}

export function TimelineCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="surface rounded-3xl border border-border/70 p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{appointment.person.fullName}</p>
          <p className="mt-1 text-sm text-saffron">{appointment.position.name}</p>
        </div>
        <DataPill tone="warm">{appointment.isCurrent ? "Current" : "Former"}</DataPill>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{formatDateRange(appointment.startDate, appointment.endDate)}</p>
      {appointment.person.politicalParty?.name ? (
        <p className="mt-2 text-sm text-muted-foreground">{appointment.person.politicalParty.name}</p>
      ) : null}
    </div>
  );
}

export function DetailCard({
  label,
  value,
  href
}: {
  label: string;
  value?: string | null;
  href?: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="surface rounded-2xl border border-border/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      {href ? (
        <a className="mt-2 block text-sm font-medium text-saffron hover:underline" href={href} target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="surface rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
