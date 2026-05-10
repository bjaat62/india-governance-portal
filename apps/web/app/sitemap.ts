import type { MetadataRoute } from "next";

import { getLeaders, getStates } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/leaders`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/states`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/admin/login`,
      lastModified: new Date()
    }
  ];

  try {
    const [states, leaders] = await Promise.all([getStates(), getLeaders({ limit: 100 })]);

    return [
      ...staticRoutes,
      ...states.map((state) => ({
        url: `${baseUrl}/states/${state.slug}`,
        lastModified: new Date()
      })),
      ...leaders.people.map((person) => ({
        url: `${baseUrl}/people/${person.slug}`,
        lastModified: new Date()
      }))
    ];
  } catch {
    return staticRoutes;
  }
}
