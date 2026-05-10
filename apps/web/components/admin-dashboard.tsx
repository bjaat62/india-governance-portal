"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useLocale } from "@/components/providers";
import { DataPill, EmptyState } from "@/components/ui";
import { resolveAssetUrl } from "@/lib/api";
import type { AdminOverview, Appointment, MetaResponse, Ministry, StateRecord } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
const TOKEN_KEY = "igp-admin-token";

type ViewTab = "people" | "states" | "ministries";

type AdminPerson = {
  id: string;
  fullName: string;
  slug: string;
  honorific?: string | null;
  photoUrl?: string | null;
  biography?: string | null;
  education?: string | null;
  officialWebsite?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  wikipediaUrl?: string | null;
  gender?: string | null;
  homeStateId?: string | null;
  politicalPartyId?: string | null;
  homeState?: StateRecord | null;
  politicalParty?: MetaResponse["parties"][number] | null;
  appointments: Appointment[];
};

type AppointmentDraft = {
  positionId: string;
  stateId: string;
  ministryId: string;
  titleOverride: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  orderRank: number;
};

type PersonForm = {
  id?: string;
  fullName: string;
  honorific: string;
  gender: string;
  photoUrl: string;
  biography: string;
  education: string;
  officialWebsite: string;
  twitterUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  wikipediaUrl: string;
  politicalPartyId: string;
  homeStateId: string;
  appointments: AppointmentDraft[];
};

type StateForm = {
  id?: string;
  name: string;
  code: string;
  type: "STATE" | "UNION_TERRITORY";
  capital: string;
  zone: string;
  description: string;
  officialWebsite: string;
  mapX: string;
  mapY: string;
  assemblySeats: string;
  councilSeats: string;
  lokSabhaSeats: string;
  rajyaSabhaSeats: string;
};

type MinistryForm = {
  id?: string;
  name: string;
  shortName: string;
  description: string;
  officialWebsite: string;
};

const blankAppointment = (): AppointmentDraft => ({
  positionId: "",
  stateId: "",
  ministryId: "",
  titleOverride: "",
  startDate: "",
  endDate: "",
  isCurrent: true,
  orderRank: 0
});

const blankPerson = (): PersonForm => ({
  fullName: "",
  honorific: "",
  gender: "",
  photoUrl: "",
  biography: "",
  education: "",
  officialWebsite: "",
  twitterUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  wikipediaUrl: "",
  politicalPartyId: "",
  homeStateId: "",
  appointments: [blankAppointment()]
});

const blankState = (): StateForm => ({
  name: "",
  code: "",
  type: "STATE",
  capital: "",
  zone: "",
  description: "",
  officialWebsite: "",
  mapX: "",
  mapY: "",
  assemblySeats: "",
  councilSeats: "",
  lokSabhaSeats: "",
  rajyaSabhaSeats: ""
});

const blankMinistry = (): MinistryForm => ({
  name: "",
  shortName: "",
  description: "",
  officialWebsite: ""
});

function numberOrUndefined(value: string) {
  return value === "" ? undefined : Number(value);
}

export function AdminDashboard() {
  const { t } = useLocale();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>("people");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [people, setPeople] = useState<AdminPerson[]>([]);
  const [states, setStates] = useState<StateRecord[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [personForm, setPersonForm] = useState<PersonForm>(blankPerson());
  const [stateForm, setStateForm] = useState<StateForm>(blankState());
  const [ministryForm, setMinistryForm] = useState<MinistryForm>(blankMinistry());
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    setToken(savedToken);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadAdminData(token);
  }, [token]);

  async function authorizedFetch(path: string, init?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {})
      }
    });

    if (response.status === 401) {
      handleSignOut();
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message ?? "Request failed.");
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function loadAdminData(authToken: string) {
    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${authToken}`
      };
      const [overviewData, peopleData, stateData, ministryData, metaData] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/overview`, { headers }).then((response) => response.json()),
        fetch(`${API_BASE_URL}/admin/people`, { headers }).then((response) => response.json()),
        fetch(`${API_BASE_URL}/admin/states`, { headers }).then((response) => response.json()),
        fetch(`${API_BASE_URL}/admin/ministries`, { headers }).then((response) => response.json()),
        fetch(`${API_BASE_URL}/meta`).then((response) => response.json())
      ]);

      setOverview(overviewData as AdminOverview);
      setPeople(peopleData as AdminPerson[]);
      setStates(stateData as StateRecord[]);
      setMinistries(ministryData as Ministry[]);
      setMeta(metaData as MetaResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load admin workspace.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOverview(null);
    setMeta(null);
    setPeople([]);
    setStates([]);
    setMinistries([]);
  }

  function editPerson(person: AdminPerson) {
    setPersonForm({
      id: person.id,
      fullName: person.fullName,
      honorific: person.honorific ?? "",
      gender: person.gender ?? "",
      photoUrl: person.photoUrl ?? "",
      biography: person.biography ?? "",
      education: person.education ?? "",
      officialWebsite: person.officialWebsite ?? "",
      twitterUrl: person.twitterUrl ?? "",
      instagramUrl: person.instagramUrl ?? "",
      facebookUrl: person.facebookUrl ?? "",
      linkedinUrl: person.linkedinUrl ?? "",
      wikipediaUrl: person.wikipediaUrl ?? "",
      politicalPartyId: person.politicalParty?.id ?? "",
      homeStateId: person.homeState?.id ?? "",
      appointments: person.appointments.map((appointment) => ({
        positionId: appointment.position.id,
        stateId: appointment.state?.id ?? "",
        ministryId: appointment.ministry?.id ?? "",
        titleOverride: appointment.titleOverride ?? "",
        startDate: appointment.startDate.slice(0, 10),
        endDate: appointment.endDate ? appointment.endDate.slice(0, 10) : "",
        isCurrent: appointment.isCurrent,
        orderRank: appointment.orderRank
      }))
    });
    setActiveTab("people");
  }

  function editState(state: StateRecord) {
    setStateForm({
      id: state.id,
      name: state.name,
      code: state.code,
      type: state.type,
      capital: state.capital ?? "",
      zone: state.zone ?? "",
      description: state.description ?? "",
      officialWebsite: state.officialWebsite ?? "",
      mapX: state.mapX?.toString() ?? "",
      mapY: state.mapY?.toString() ?? "",
      assemblySeats: state.assemblySeats?.toString() ?? "",
      councilSeats: state.councilSeats?.toString() ?? "",
      lokSabhaSeats: state.lokSabhaSeats?.toString() ?? "",
      rajyaSabhaSeats: state.rajyaSabhaSeats?.toString() ?? ""
    });
    setActiveTab("states");
  }

  function editMinistry(ministry: Ministry) {
    setMinistryForm({
      id: ministry.id,
      name: ministry.name,
      shortName: ministry.shortName ?? "",
      description: ministry.description ?? "",
      officialWebsite: ministry.officialWebsite ?? ""
    });
    setActiveTab("ministries");
  }

  async function uploadPhoto(file: File) {
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await authorizedFetch("/admin/upload", {
        method: "POST",
        body: formData
      });
      setPersonForm((current) => ({ ...current, photoUrl: `${API_ORIGIN}${(response as { url: string }).url}` }));
      setNotice("Photo uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Photo upload failed.");
    } finally {
      setSaving(false);
    }
  }

  async function savePerson() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...personForm,
        appointments: personForm.appointments.map((appointment) => ({
          ...appointment,
          stateId: appointment.stateId || undefined,
          ministryId: appointment.ministryId || undefined,
          titleOverride: appointment.titleOverride || undefined,
          endDate: appointment.endDate || undefined
        }))
      };

      await authorizedFetch(personForm.id ? `/admin/people/${personForm.id}` : "/admin/people", {
        method: personForm.id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      setPersonForm(blankPerson());
      setNotice("Person saved successfully.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save person.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePerson(id: string) {
    if (!window.confirm("Delete this profile?")) {
      return;
    }

    try {
      await authorizedFetch(`/admin/people/${id}`, { method: "DELETE" });
      setNotice("Profile deleted.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete profile.");
    }
  }

  async function saveState() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authorizedFetch(stateForm.id ? `/admin/states/${stateForm.id}` : "/admin/states", {
        method: stateForm.id ? "PUT" : "POST",
        body: JSON.stringify({
          ...stateForm,
          mapX: numberOrUndefined(stateForm.mapX),
          mapY: numberOrUndefined(stateForm.mapY),
          assemblySeats: numberOrUndefined(stateForm.assemblySeats),
          councilSeats: numberOrUndefined(stateForm.councilSeats),
          lokSabhaSeats: numberOrUndefined(stateForm.lokSabhaSeats),
          rajyaSabhaSeats: numberOrUndefined(stateForm.rajyaSabhaSeats)
        })
      });
      setStateForm(blankState());
      setNotice("State saved successfully.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save state.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteState(id: string) {
    if (!window.confirm("Delete this jurisdiction?")) {
      return;
    }

    try {
      await authorizedFetch(`/admin/states/${id}`, { method: "DELETE" });
      setNotice("State deleted.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete state.");
    }
  }

  async function saveMinistry() {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authorizedFetch(ministryForm.id ? `/admin/ministries/${ministryForm.id}` : "/admin/ministries", {
        method: ministryForm.id ? "PUT" : "POST",
        body: JSON.stringify(ministryForm)
      });
      setMinistryForm(blankMinistry());
      setNotice("Ministry saved successfully.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save ministry.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMinistry(id: string) {
    if (!window.confirm("Delete this ministry?")) {
      return;
    }

    try {
      await authorizedFetch(`/admin/ministries/${id}`, { method: "DELETE" });
      setNotice("Ministry deleted.");
      if (token) {
        await loadAdminData(token);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete ministry.");
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading admin workspace...</div>;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <div className="surface rounded-[2rem] border border-border/80 p-10 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">Admin</p>
          <h1 className="mt-4 font-display text-4xl text-foreground">Secure portal management</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">{t("adminSubtitle")}</p>
          <Link
            href="/admin/login"
            className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">Admin Dashboard</p>
          <h1 className="mt-2 font-display text-4xl text-foreground">Content and governance data management</h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-muted-foreground">{t("adminSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-saffron/30"
        >
          {t("signOut")}
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="surface rounded-3xl border border-border/80 p-5 shadow-card">
          <p className="text-sm text-muted-foreground">People</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{overview?.peopleCount ?? 0}</p>
        </div>
        <div className="surface rounded-3xl border border-border/80 p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Current Appointments</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{overview?.currentAppointments ?? 0}</p>
        </div>
        <div className="surface rounded-3xl border border-border/80 p-5 shadow-card">
          <p className="text-sm text-muted-foreground">States & UTs</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{overview?.stateCount ?? 0}</p>
        </div>
        <div className="surface rounded-3xl border border-border/80 p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Ministries</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{overview?.ministryCount ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(["people", "states", "ministries"] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab ? "bg-navy text-white" : "border border-border text-foreground hover:border-saffron/30"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "people" && meta ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-foreground">{personForm.id ? "Edit person" : "Add person"}</h2>
              <button
                type="button"
                onClick={() => setPersonForm(blankPerson())}
                className="text-sm font-semibold text-saffron"
              >
                Reset
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={personForm.fullName} onChange={(event) => setPersonForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={personForm.honorific} onChange={(event) => setPersonForm((current) => ({ ...current, honorific: event.target.value }))} placeholder="Honorific" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={personForm.gender} onChange={(event) => setPersonForm((current) => ({ ...current, gender: event.target.value }))} placeholder="Gender" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <select value={personForm.homeStateId} onChange={(event) => setPersonForm((current) => ({ ...current, homeStateId: event.target.value }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                <option value="">Home state</option>
                {meta.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <select value={personForm.politicalPartyId} onChange={(event) => setPersonForm((current) => ({ ...current, politicalPartyId: event.target.value }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                <option value="">Political party</option>
                {meta.parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
              <input value={personForm.education} onChange={(event) => setPersonForm((current) => ({ ...current, education: event.target.value }))} placeholder="Education" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={personForm.officialWebsite} onChange={(event) => setPersonForm((current) => ({ ...current, officialWebsite: event.target.value }))} placeholder="Official website" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none md:col-span-2" />
              <input value={personForm.photoUrl} onChange={(event) => setPersonForm((current) => ({ ...current, photoUrl: event.target.value }))} placeholder="Photo URL" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none md:col-span-2" />
              <input value={personForm.twitterUrl} onChange={(event) => setPersonForm((current) => ({ ...current, twitterUrl: event.target.value }))} placeholder="Twitter / X URL" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={personForm.linkedinUrl} onChange={(event) => setPersonForm((current) => ({ ...current, linkedinUrl: event.target.value }))} placeholder="LinkedIn URL" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
            </div>

            <label className="mt-4 block rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Upload profile photo
              <input
                type="file"
                accept="image/*"
                className="mt-2 block"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadPhoto(file);
                  }
                }}
              />
            </label>

            {personForm.photoUrl ? (
              <img
                src={resolveAssetUrl(personForm.photoUrl)}
                alt="Preview"
                className="mt-4 h-36 w-28 rounded-2xl border border-border object-cover"
              />
            ) : null}

            <textarea value={personForm.biography} onChange={(event) => setPersonForm((current) => ({ ...current, biography: event.target.value }))} placeholder="Biography" rows={4} className="mt-4 w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm outline-none" />

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Appointments</h3>
                <button
                  type="button"
                  onClick={() =>
                    setPersonForm((current) => ({ ...current, appointments: [...current.appointments, blankAppointment()] }))
                  }
                  className="text-sm font-semibold text-saffron"
                >
                  Add appointment
                </button>
              </div>

              {personForm.appointments.map((appointment, index) => (
                <div key={`${index}-${appointment.positionId}`} className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4 dark:bg-white/5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <select value={appointment.positionId} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, positionId: event.target.value } : item) }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                      <option value="">Position</option>
                      {meta.positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                    <select value={appointment.stateId} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, stateId: event.target.value } : item) }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                      <option value="">State</option>
                      {meta.states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <select value={appointment.ministryId} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, ministryId: event.target.value } : item) }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                      <option value="">Ministry</option>
                      {meta.ministries.map((ministry) => (
                        <option key={ministry.id} value={ministry.id}>
                          {ministry.name}
                        </option>
                      ))}
                    </select>
                    <input value={appointment.titleOverride} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, titleOverride: event.target.value } : item) }))} placeholder="Title override" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
                    <input type="date" value={appointment.startDate} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, startDate: event.target.value } : item) }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
                    <input type="date" value={appointment.endDate} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, endDate: event.target.value } : item) }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
                    <input type="number" value={appointment.orderRank} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, orderRank: Number(event.target.value) } : item) }))} placeholder="Rank" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
                    <label className="flex items-center gap-2 rounded-2xl border border-border px-4 text-sm text-foreground">
                      <input type="checkbox" checked={appointment.isCurrent} onChange={(event) => setPersonForm((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, isCurrent: event.target.checked } : item) }))} />
                      Current appointment
                    </label>
                  </div>
                  {personForm.appointments.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPersonForm((current) => ({
                          ...current,
                          appointments: current.appointments.filter((_, itemIndex) => itemIndex !== index)
                        }))
                      }
                      className="mt-3 text-sm font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void savePerson()}
              disabled={saving}
              className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald disabled:opacity-60"
            >
              {saving ? "Saving..." : personForm.id ? "Update person" : "Create person"}
            </button>
          </div>

          <div className="space-y-4">
            {people.length ? (
              people.map((person) => (
                <div key={person.id} className="surface rounded-[1.75rem] border border-border/80 p-5 shadow-card">
                  <div className="flex items-start gap-4">
                    <img
                      src={resolveAssetUrl(person.photoUrl)}
                      alt={person.fullName}
                      className="h-16 w-16 rounded-2xl border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{person.fullName}</p>
                        {person.politicalParty?.abbreviation ? <DataPill>{person.politicalParty.abbreviation}</DataPill> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {person.appointments[0]?.titleOverride ?? person.appointments[0]?.position.name ?? "No appointment yet"}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <button type="button" onClick={() => editPerson(person)} className="text-sm font-semibold text-saffron">
                          Edit
                        </button>
                        <button type="button" onClick={() => void deletePerson(person.id)} className="text-sm font-semibold text-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No people records found." />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "states" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">{stateForm.id ? "Edit state" : "Add state / UT"}</h2>
              <button type="button" onClick={() => setStateForm(blankState())} className="text-sm font-semibold text-saffron">
                Reset
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input value={stateForm.name} onChange={(event) => setStateForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.code} onChange={(event) => setStateForm((current) => ({ ...current, code: event.target.value }))} placeholder="Code" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <select value={stateForm.type} onChange={(event) => setStateForm((current) => ({ ...current, type: event.target.value as "STATE" | "UNION_TERRITORY" }))} className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none">
                <option value="STATE">State</option>
                <option value="UNION_TERRITORY">Union Territory</option>
              </select>
              <input value={stateForm.capital} onChange={(event) => setStateForm((current) => ({ ...current, capital: event.target.value }))} placeholder="Capital" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.zone} onChange={(event) => setStateForm((current) => ({ ...current, zone: event.target.value }))} placeholder="Zone" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.officialWebsite} onChange={(event) => setStateForm((current) => ({ ...current, officialWebsite: event.target.value }))} placeholder="Official website" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.mapX} onChange={(event) => setStateForm((current) => ({ ...current, mapX: event.target.value }))} placeholder="Map X" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.mapY} onChange={(event) => setStateForm((current) => ({ ...current, mapY: event.target.value }))} placeholder="Map Y" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.assemblySeats} onChange={(event) => setStateForm((current) => ({ ...current, assemblySeats: event.target.value }))} placeholder="Assembly seats" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.councilSeats} onChange={(event) => setStateForm((current) => ({ ...current, councilSeats: event.target.value }))} placeholder="Council seats" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.lokSabhaSeats} onChange={(event) => setStateForm((current) => ({ ...current, lokSabhaSeats: event.target.value }))} placeholder="Lok Sabha seats" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={stateForm.rajyaSabhaSeats} onChange={(event) => setStateForm((current) => ({ ...current, rajyaSabhaSeats: event.target.value }))} placeholder="Rajya Sabha seats" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
            </div>
            <textarea value={stateForm.description} onChange={(event) => setStateForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} className="mt-4 w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm outline-none" />
            <button type="button" onClick={() => void saveState()} disabled={saving} className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald disabled:opacity-60">
              {saving ? "Saving..." : stateForm.id ? "Update state" : "Create state"}
            </button>
          </div>

          <div className="space-y-4">
            {states.map((state) => (
              <div key={state.id} className="surface rounded-[1.75rem] border border-border/80 p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{state.name}</p>
                      <DataPill>{state.code}</DataPill>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{state.capital ?? "No capital provided"}</p>
                  </div>
                  <DataPill tone="warm">{state.type === "STATE" ? "State" : "UT"}</DataPill>
                </div>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={() => editState(state)} className="text-sm font-semibold text-saffron">
                    Edit
                  </button>
                  <button type="button" onClick={() => void deleteState(state.id)} className="text-sm font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "ministries" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="surface rounded-[2rem] border border-border/80 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">{ministryForm.id ? "Edit ministry" : "Add ministry"}</h2>
              <button type="button" onClick={() => setMinistryForm(blankMinistry())} className="text-sm font-semibold text-saffron">
                Reset
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <input value={ministryForm.name} onChange={(event) => setMinistryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={ministryForm.shortName} onChange={(event) => setMinistryForm((current) => ({ ...current, shortName: event.target.value }))} placeholder="Short name" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <input value={ministryForm.officialWebsite} onChange={(event) => setMinistryForm((current) => ({ ...current, officialWebsite: event.target.value }))} placeholder="Official website" className="h-11 rounded-2xl border border-border bg-transparent px-4 text-sm outline-none" />
              <textarea value={ministryForm.description} onChange={(event) => setMinistryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} className="rounded-2xl border border-border bg-transparent px-4 py-3 text-sm outline-none" />
            </div>
            <button type="button" onClick={() => void saveMinistry()} disabled={saving} className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald disabled:opacity-60">
              {saving ? "Saving..." : ministryForm.id ? "Update ministry" : "Create ministry"}
            </button>
          </div>

          <div className="space-y-4">
            {ministries.length ? (
              ministries.map((ministry) => (
                <div key={ministry.id} className="surface rounded-[1.75rem] border border-border/80 p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">{ministry.name}</p>
                        {ministry.shortName ? <DataPill>{ministry.shortName}</DataPill> : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{ministry.description ?? "No description provided."}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => editMinistry(ministry)} className="text-sm font-semibold text-saffron">
                      Edit
                    </button>
                    <button type="button" onClick={() => void deleteMinistry(ministry.id)} className="text-sm font-semibold text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No ministry records found." />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
