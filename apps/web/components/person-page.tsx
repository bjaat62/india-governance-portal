"use client";

import { useLocale } from "@/components/providers";
import { DataPill, DetailCard, LeaderCard, SectionHeading, formatDateRange } from "@/components/ui";
import { resolveAssetUrl } from "@/lib/api";
import type { PersonResponse } from "@/lib/types";

export function PersonPage({ data }: { data: PersonResponse }) {
  const { t } = useLocale();
  const currentAppointments = data.person.appointments.filter((appointment) => appointment.isCurrent);

  return (
    <div className="space-y-10">
      <section className="surface overflow-hidden rounded-[2rem] border border-border/80 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <img
              src={resolveAssetUrl(data.person.photoUrl)}
              alt={data.person.fullName}
              className="h-[320px] w-full rounded-[2rem] border border-border/80 object-cover"
            />
            <div className="flex flex-wrap gap-2">
              {data.person.politicalParty?.abbreviation ? <DataPill tone="warm">{data.person.politicalParty.abbreviation}</DataPill> : null}
              {data.person.homeState?.name ? <DataPill>{data.person.homeState.name}</DataPill> : null}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">Profile</p>
              <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">{data.person.fullName}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentAppointments.map((appointment) => (
                  <DataPill key={appointment.id}>{appointment.titleOverride ?? appointment.position.name}</DataPill>
                ))}
              </div>
            </div>

            <p className="max-w-3xl text-base leading-8 text-muted-foreground">{data.person.biography}</p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard
                label="Primary office"
                value={currentAppointments[0]?.titleOverride ?? currentAppointments[0]?.position.name}
              />
              <DetailCard label={t("politicalParty")} value={data.person.politicalParty?.name} />
              <DetailCard label={t("education")} value={data.person.education} />
              <DetailCard label="State" value={data.person.homeState?.name} />
              <DetailCard label={t("officialWebsite")} value={data.person.officialWebsite} href={data.person.officialWebsite} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard label="X / Twitter" value={data.person.twitterUrl} href={data.person.twitterUrl} />
              <DetailCard label="Instagram" value={data.person.instagramUrl} href={data.person.instagramUrl} />
              <DetailCard label="Facebook" value={data.person.facebookUrl} href={data.person.facebookUrl} />
              <DetailCard label="LinkedIn" value={data.person.linkedinUrl} href={data.person.linkedinUrl} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("tenure")} title="Appointments and tenure timeline" description="Every office held by this profile is tracked as a separate appointment for historical continuity." />
        <div className="grid gap-4 xl:grid-cols-2">
          {data.person.appointments.map((appointment) => (
            <div key={appointment.id} className="surface rounded-[2rem] border border-border/80 p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">{appointment.titleOverride ?? appointment.position.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[appointment.state?.name, appointment.ministry?.name].filter(Boolean).join(" • ") || "National office"}
                  </p>
                </div>
                <DataPill tone="warm">{appointment.isCurrent ? "Current" : "Former"}</DataPill>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{formatDateRange(appointment.startDate, appointment.endDate)}</p>
              {appointment.notes ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{appointment.notes}</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow={t("relatedProfiles")} title="Related leadership profiles" description="Suggested by party, state, and institutional overlap." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.relatedPeople.map((person) => (
            <LeaderCard key={person.id} person={person} appointment={person.appointments[0]} />
          ))}
        </div>
      </section>
    </div>
  );
}
