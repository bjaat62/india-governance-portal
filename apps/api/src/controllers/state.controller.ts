import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

export async function getStates(request: Request, response: Response) {
  const query = z
    .object({
      search: z.string().optional(),
      type: z.enum(["STATE", "UNION_TERRITORY"]).optional()
    })
    .parse(request.query);

  const states = await prisma.state.findMany({
    where: {
      type: query.type,
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: "insensitive"
                }
              },
              {
                capital: {
                  contains: query.search,
                  mode: "insensitive"
                }
              }
            ]
          }
        : {})
    },
    orderBy: { name: "asc" }
  });

  response.json(states);
}

export async function getStateBySlug(request: Request, response: Response) {
  const { slug } = z.object({ slug: z.string() }).parse(request.params);

  const state = await prisma.state.findUnique({
    where: { slug },
    include: {
      appointments: {
        where: { isCurrent: true },
        include: {
          person: {
            include: {
              politicalParty: true,
              homeState: true
            }
          },
          position: true,
          ministry: true
        },
        orderBy: [{ orderRank: "asc" }, { person: { fullName: "asc" } }]
      }
    }
  });

  if (!state) {
    response.status(404).json({ message: "State or union territory not found." });
    return;
  }

  const sections = {
    governor: state.appointments.find(
      (appointment) =>
        appointment.position.slug === "governor" ||
        appointment.position.slug === "lt-governor-administrator"
    ),
    chiefMinister: state.appointments.find((appointment) => appointment.position.slug === "chief-minister"),
    ministers: state.appointments.filter((appointment) =>
      ["chief-minister", "deputy-chief-minister", "state-cabinet-minister"].includes(appointment.position.slug)
    ),
    mlas: state.appointments.filter((appointment) => appointment.position.slug === "member-of-legislative-assembly"),
    mps: state.appointments.filter((appointment) =>
      ["lok-sabha-mp", "rajya-sabha-mp"].includes(appointment.position.slug)
    ),
    vidhanSabhaSpeaker: state.appointments.find((appointment) => appointment.position.slug === "vidhan-sabha-speaker"),
    vidhanParishadChairman: state.appointments.find(
      (appointment) => appointment.position.slug === "vidhan-parishad-chairman"
    ),
    administrators: state.appointments.filter((appointment) =>
      ["chief-secretary", "governor", "lt-governor-administrator"].includes(appointment.position.slug)
    )
  };

  response.json({
    state: {
      ...state,
      appointments: undefined
    },
    sections,
    featuredAppointments: state.appointments
  });
}
