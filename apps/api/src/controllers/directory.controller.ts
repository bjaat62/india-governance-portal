import { PositionCategory, Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

const directoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
  search: z.string().optional(),
  state: z.string().optional(),
  position: z.string().optional(),
  party: z.string().optional(),
  ministry: z.string().optional(),
  category: z.enum(["constitutional", "political", "judicial", "defence", "legislative", "administrative"]).optional()
});

export async function getDashboard(_request: Request, response: Response) {
  const [
    stateCount,
    ministryCount,
    peopleCount,
    appointmentCount,
    categories,
    featuredLeaders,
    formerPrimeMinisters,
    formerPresidents
  ] = await Promise.all([
    prisma.state.count({ where: { type: "STATE" } }),
    prisma.ministry.count(),
    prisma.person.count(),
    prisma.appointment.count({ where: { isCurrent: true } }),
    prisma.position.groupBy({
      by: ["category"],
      _count: {
        _all: true
      }
    }),
    prisma.appointment.findMany({
      where: {
        isCurrent: true,
        position: {
          slug: {
            in: [
              "president-of-india",
              "prime-minister-of-india",
              "vice-president-of-india",
              "chief-justice-of-india",
              "chief-of-defence-staff"
            ]
          }
        }
      },
      orderBy: [{ orderRank: "asc" }, { person: { fullName: "asc" } }],
      include: {
        person: {
          include: {
            politicalParty: true,
            homeState: true
          }
        },
        position: true,
        state: true,
        ministry: true
      }
    }),
    prisma.appointment.findMany({
      where: {
        position: { slug: "prime-minister-of-india" },
        isCurrent: false
      },
      orderBy: { startDate: "desc" },
      take: 6,
      include: {
        person: {
          include: {
            politicalParty: true
          }
        },
        position: true
      }
    }),
    prisma.appointment.findMany({
      where: {
        position: { slug: "president-of-india" },
        isCurrent: false
      },
      orderBy: { startDate: "desc" },
      take: 6,
      include: {
        person: {
          include: {
            politicalParty: true
          }
        },
        position: true
      }
    })
  ]);

  response.json({
    stats: {
      states: stateCount,
      unionTerritories: 8,
      ministries: ministryCount,
      trackedProfiles: peopleCount,
      liveAppointments: appointmentCount
    },
    categories,
    featuredLeaders,
    timelines: {
      formerPrimeMinisters,
      formerPresidents
    }
  });
}

export async function getMeta(_request: Request, response: Response) {
  const [states, positions, ministries, parties] = await Promise.all([
    prisma.state.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.position.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    }),
    prisma.ministry.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.politicalParty.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  response.json({
    states,
    positions,
    ministries,
    parties
  });
}

export async function getCategories(_request: Request, response: Response) {
  const categories = await prisma.position.groupBy({
    by: ["category"],
    _count: {
      _all: true
    }
  });

  response.json(
    categories.map((item) => ({
      slug: item.category.toLowerCase(),
      label: item.category,
      totalPositions: item._count._all
    }))
  );
}

export async function getPositions(request: Request, response: Response) {
  const filters = z
    .object({
      category: z.nativeEnum(PositionCategory).optional(),
      level: z.enum(["NATIONAL", "STATE", "UNION_TERRITORY"]).optional()
    })
    .parse(request.query);

  const positions = await prisma.position.findMany({
    where: {
      category: filters.category,
      level: filters.level
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });

  response.json(positions);
}

export async function getPeople(request: Request, response: Response) {
  const filters = directoryQuerySchema.parse(request.query);
  const skip = (filters.page - 1) * filters.limit;
  const appointmentFilter: Prisma.AppointmentWhereInput = {
    isCurrent: true
  };

  let appointmentPositionFilter: Prisma.PositionWhereInput | undefined;

  if (filters.state) {
    appointmentFilter.state = { slug: filters.state };
  }

  if (filters.position) {
    appointmentPositionFilter = {
      AND: [
        ...(Array.isArray(appointmentPositionFilter?.AND) ? appointmentPositionFilter.AND : []),
        { slug: filters.position }
      ]
    };
  }

  if (filters.ministry) {
    appointmentFilter.ministry = { slug: filters.ministry };
  }

  if (filters.category) {
    appointmentPositionFilter = {
      ...(appointmentPositionFilter ?? {}),
      category: filters.category.toUpperCase() as PositionCategory
    };
  }

  if (appointmentPositionFilter) {
    appointmentFilter.position = appointmentPositionFilter;
  }

  const personWhere: Prisma.PersonWhereInput = {
    AND: [
      filters.search
        ? {
            OR: [
              {
                fullName: {
                  contains: filters.search,
                  mode: "insensitive" as const
                }
              },
              {
                appointments: {
                  some: {
                    titleOverride: {
                      contains: filters.search,
                      mode: "insensitive" as const
                    }
                  }
                }
              }
            ]
          }
        : {},
      {
        appointments: {
          some: appointmentFilter
        }
      },
      filters.party
        ? {
            politicalParty: {
              slug: filters.party
            }
          }
        : {}
    ]
  };

  const [total, people] = await Promise.all([
    prisma.person.count({
      where: personWhere
    }),
    prisma.person.findMany({
      where: personWhere,
      include: {
        politicalParty: true,
        homeState: true,
        appointments: {
          where: { isCurrent: true },
          include: {
            position: true,
            state: true,
            ministry: true
          },
          orderBy: [{ orderRank: "asc" }, { startDate: "desc" }]
        }
      },
      orderBy: { fullName: "asc" },
      skip,
      take: filters.limit
    })
  ]);

  response.json({
    page: filters.page,
    limit: filters.limit,
    total,
    people
  });
}

export async function getPersonBySlug(request: Request, response: Response) {
  const { slug } = z.object({ slug: z.string() }).parse(request.params);

  const person = await prisma.person.findUnique({
    where: { slug },
    include: {
      homeState: true,
      politicalParty: true,
      appointments: {
        include: {
          position: true,
          state: true,
          ministry: true
        },
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }]
      }
    }
  });

  if (!person) {
    response.status(404).json({ message: "Person not found." });
    return;
  }

  const relatedConditions: Prisma.PersonWhereInput[] = [];

  if (person.politicalPartyId) {
    relatedConditions.push({
      politicalPartyId: person.politicalPartyId
    });
  }

  if (person.homeStateId) {
    relatedConditions.push({
      homeStateId: person.homeStateId
    });
  }

  const relatedPeople = await prisma.person.findMany({
    where: {
      id: {
        not: person.id
      },
      ...(relatedConditions.length ? { OR: relatedConditions } : {})
    },
    include: {
      politicalParty: true,
      homeState: true,
      appointments: {
        where: { isCurrent: true },
        include: {
          position: true,
          state: true
        },
        take: 1
      }
    },
    take: 6
  });

  response.json({
    person,
    relatedPeople
  });
}

export async function getTimelines(request: Request, response: Response) {
  const query = z
    .object({
      position: z.string(),
      limit: z.coerce.number().min(1).max(50).default(12)
    })
    .parse(request.query);

  const items = await prisma.appointment.findMany({
    where: {
      position: {
        slug: query.position
      }
    },
    orderBy: { startDate: "desc" },
    take: query.limit,
    include: {
      person: {
        include: {
          politicalParty: true,
          homeState: true
        }
      },
      position: true,
      state: true,
      ministry: true
    }
  });

  response.json(items);
}

export async function getNews(_request: Request, response: Response) {
  response.json([
    {
      id: "governance-stack",
      title: "Digital governance systems continue to expand citizen-facing services",
      excerpt:
        "Public service delivery is increasingly shaped by interoperable digital identity, payments, and workflow platforms.",
      publishedAt: "2026-05-01",
      category: "Governance"
    },
    {
      id: "judicial-modernization",
      title: "Judicial modernization programs emphasize accessibility and case-flow efficiency",
      excerpt:
        "Technology-first court administration remains a major focus area for improving transparency and speed.",
      publishedAt: "2026-04-24",
      category: "Judiciary"
    },
    {
      id: "federal-coordination",
      title: "Centre-state coordination stays central to infrastructure and welfare execution",
      excerpt:
        "State capacity, data pipelines, and inter-ministerial review processes continue to shape policy outcomes.",
      publishedAt: "2026-04-18",
      category: "Federal Affairs"
    }
  ]);
}
