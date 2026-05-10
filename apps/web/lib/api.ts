import type {
  DashboardResponse,
  DirectoryResponse,
  MetaResponse,
  NewsItem,
  PersonResponse,
  StateDetailResponse,
  StateRecord
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

type FetchOptions = {
  revalidate?: number;
  cache?: RequestCache;
};

export function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function fetchApi<T>(path: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: options?.revalidate ?? 60 },
    cache: options?.cache
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return (await response.json()) as T;
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return "/images/official-placeholder.svg";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

export async function getDashboard() {
  return fetchApi<DashboardResponse>("/dashboard");
}

export async function getMeta() {
  return fetchApi<MetaResponse>("/meta");
}

export async function getNews() {
  return fetchApi<NewsItem[]>("/news");
}

export async function getStates() {
  return fetchApi<StateRecord[]>("/states");
}

export async function getLeaders(query: Record<string, string | number | undefined>) {
  return fetchApi<DirectoryResponse>(`/people${toQueryString(query)}`);
}

export async function getCategoryLeaders(slug: string) {
  return fetchApi<DirectoryResponse>(`/people${toQueryString({ category: slug, limit: 48 })}`);
}

export async function getCategoryPositions(slug: string) {
  return fetchApi<MetaResponse["positions"]>(`/positions${toQueryString({ category: slug.toUpperCase() })}`);
}

export async function getState(slug: string) {
  return fetchApi<StateDetailResponse>(`/states/${slug}`);
}

export async function getPerson(slug: string) {
  return fetchApi<PersonResponse>(`/people/${slug}`);
}
