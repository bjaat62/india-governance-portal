export type CategorySlug =
  | "constitutional"
  | "political"
  | "judicial"
  | "defence"
  | "legislative"
  | "administrative";

export interface PoliticalParty {
  id: string;
  name: string;
  slug: string;
  abbreviation?: string | null;
  ideology?: string | null;
  colorHex?: string | null;
}

export interface StateRecord {
  id: string;
  name: string;
  slug: string;
  code: string;
  type: "STATE" | "UNION_TERRITORY";
  capital?: string | null;
  zone?: string | null;
  description?: string | null;
  officialWebsite?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  assemblySeats?: number | null;
  councilSeats?: number | null;
  lokSabhaSeats?: number | null;
  rajyaSabhaSeats?: number | null;
}

export interface Position {
  id: string;
  name: string;
  slug: string;
  category: string;
  level: "NATIONAL" | "STATE" | "UNION_TERRITORY";
  description?: string | null;
  sortOrder: number;
  isElective: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  slug: string;
  shortName?: string | null;
  description?: string | null;
  officialWebsite?: string | null;
}

export interface PersonSummary {
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
  homeState?: StateRecord | null;
  politicalParty?: PoliticalParty | null;
}

export interface Appointment {
  id: string;
  titleOverride?: string | null;
  categoryTag?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  orderRank: number;
  notes?: string | null;
  sourceUrl?: string | null;
  person: PersonSummary;
  position: Position;
  state?: StateRecord | null;
  ministry?: Ministry | null;
}

export interface PersonDetail extends PersonSummary {
  gender?: string | null;
  seoDescription?: string | null;
  appointments: Appointment[];
}

export interface DashboardResponse {
  stats: {
    states: number;
    unionTerritories: number;
    ministries: number;
    trackedProfiles: number;
    liveAppointments: number;
  };
  categories: Array<{
    category: string;
    _count: {
      _all: number;
    };
  }>;
  featuredLeaders: Appointment[];
  timelines: {
    formerPrimeMinisters: Appointment[];
    formerPresidents: Appointment[];
  };
}

export interface MetaResponse {
  states: StateRecord[];
  positions: Position[];
  ministries: Ministry[];
  parties: PoliticalParty[];
}

export interface DirectoryResponse {
  page: number;
  limit: number;
  total: number;
  people: Array<PersonSummary & { appointments: Appointment[] }>;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
}

export interface StateDetailResponse {
  state: StateRecord;
  sections: {
    governor?: Appointment | null;
    chiefMinister?: Appointment | null;
    ministers: Appointment[];
    mlas: Appointment[];
    mps: Appointment[];
    vidhanSabhaSpeaker?: Appointment | null;
    vidhanParishadChairman?: Appointment | null;
    administrators: Appointment[];
  };
  featuredAppointments: Appointment[];
}

export interface PersonResponse {
  person: PersonDetail;
  relatedPeople: Array<PersonSummary & { appointments: Appointment[] }>;
}

export interface AdminOverview {
  peopleCount: number;
  currentAppointments: number;
  stateCount: number;
  ministryCount: number;
}
