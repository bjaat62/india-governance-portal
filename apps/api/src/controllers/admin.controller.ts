import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { slugify } from "../lib/slug.js";

const appointmentSchema = z.object({
  id: z.string().optional(),
  positionId: z.string(),
  stateId: z.string().optional().nullable(),
  ministryId: z.string().optional().nullable(),
  titleOverride: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(true),
  orderRank: z.number().default(0)
});

const personSchema = z.object({
  fullName: z.string().min(2),
  honorific: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  biography: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  officialWebsite: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  wikipediaUrl: z.string().optional().nullable(),
  politicalPartyId: z.string().optional().nullable(),
  homeStateId: z.string().optional().nullable(),
  appointments: z.array(appointmentSchema).default([])
});

const stateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(4),
  type: z.enum(["STATE", "UNION_TERRITORY"]),
  capital: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  officialWebsite: z.string().optional().nullable(),
  mapX: z.number().optional().nullable(),
  mapY: z.number().optional().nullable(),
  assemblySeats: z.number().optional().nullable(),
  councilSeats: z.number().optional().nullable(),
  lokSabhaSeats: z.number().optional().nullable(),
  rajyaSabhaSeats: z.number().optional().nullable()
});

const ministrySchema = z.object({
  name: z.string().min(2),
  shortName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  officialWebsite: z.string().optional().nullable()
});

export async function getAdminOverview(_request: Request, response: Response) {
  const [peopleCount, currentAppointments, stateCount, ministryCount] = await Promise.all([
    prisma.person.count(),
    prisma.appointment.count({ where: { isCurrent: true } }),
    prisma.state.count(),
    prisma.ministry.count()
  ]);

  response.json({
    peopleCount,
    currentAppointments,
    stateCount,
    ministryCount
  });
}

export async function getAdminPeople(_request: Request, response: Response) {
  const people = await prisma.person.findMany({
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
    },
    orderBy: { updatedAt: "desc" }
  });

  response.json(people);
}

export async function createPerson(request: Request, response: Response) {
  const payload = personSchema.parse(request.body);

  const person = await prisma.person.create({
    data: {
      fullName: payload.fullName,
      slug: slugify(payload.fullName),
      honorific: payload.honorific ?? undefined,
      gender: payload.gender ?? undefined,
      photoUrl: payload.photoUrl ?? undefined,
      biography: payload.biography ?? undefined,
      education: payload.education ?? undefined,
      officialWebsite: payload.officialWebsite ?? undefined,
      twitterUrl: payload.twitterUrl ?? undefined,
      instagramUrl: payload.instagramUrl ?? undefined,
      facebookUrl: payload.facebookUrl ?? undefined,
      linkedinUrl: payload.linkedinUrl ?? undefined,
      wikipediaUrl: payload.wikipediaUrl ?? undefined,
      politicalPartyId: payload.politicalPartyId ?? undefined,
      homeStateId: payload.homeStateId ?? undefined,
      seoDescription: `${payload.fullName} profile on the India Governance Portal.`,
      appointments: {
        create: payload.appointments.map((appointment) => ({
          positionId: appointment.positionId,
          stateId: appointment.stateId ?? undefined,
          ministryId: appointment.ministryId ?? undefined,
          titleOverride: appointment.titleOverride ?? undefined,
          startDate: new Date(appointment.startDate),
          endDate: appointment.endDate ? new Date(appointment.endDate) : undefined,
          isCurrent: appointment.isCurrent,
          orderRank: appointment.orderRank
        }))
      }
    },
    include: {
      homeState: true,
      politicalParty: true,
      appointments: {
        include: {
          position: true,
          state: true,
          ministry: true
        }
      }
    }
  });

  response.status(201).json(person);
}

export async function updatePerson(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const payload = personSchema.parse(request.body);

  await prisma.appointment.deleteMany({
    where: { personId: id }
  });

  const person = await prisma.person.update({
    where: { id },
    data: {
      fullName: payload.fullName,
      slug: slugify(payload.fullName),
      honorific: payload.honorific ?? undefined,
      gender: payload.gender ?? undefined,
      photoUrl: payload.photoUrl ?? undefined,
      biography: payload.biography ?? undefined,
      education: payload.education ?? undefined,
      officialWebsite: payload.officialWebsite ?? undefined,
      twitterUrl: payload.twitterUrl ?? undefined,
      instagramUrl: payload.instagramUrl ?? undefined,
      facebookUrl: payload.facebookUrl ?? undefined,
      linkedinUrl: payload.linkedinUrl ?? undefined,
      wikipediaUrl: payload.wikipediaUrl ?? undefined,
      politicalPartyId: payload.politicalPartyId ?? undefined,
      homeStateId: payload.homeStateId ?? undefined,
      appointments: {
        create: payload.appointments.map((appointment) => ({
          positionId: appointment.positionId,
          stateId: appointment.stateId ?? undefined,
          ministryId: appointment.ministryId ?? undefined,
          titleOverride: appointment.titleOverride ?? undefined,
          startDate: new Date(appointment.startDate),
          endDate: appointment.endDate ? new Date(appointment.endDate) : undefined,
          isCurrent: appointment.isCurrent,
          orderRank: appointment.orderRank
        }))
      }
    },
    include: {
      homeState: true,
      politicalParty: true,
      appointments: {
        include: {
          position: true,
          state: true,
          ministry: true
        }
      }
    }
  });

  response.json(person);
}

export async function deletePerson(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);

  await prisma.person.delete({
    where: { id }
  });

  response.status(204).send();
}

export async function getAdminStates(_request: Request, response: Response) {
  const states = await prisma.state.findMany({
    orderBy: { name: "asc" }
  });

  response.json(states);
}

export async function createState(request: Request, response: Response) {
  const payload = stateSchema.parse(request.body);

  const state = await prisma.state.create({
    data: {
      ...payload,
      slug: slugify(payload.name)
    }
  });

  response.status(201).json(state);
}

export async function updateState(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const payload = stateSchema.parse(request.body);

  const state = await prisma.state.update({
    where: { id },
    data: {
      ...payload,
      slug: slugify(payload.name)
    }
  });

  response.json(state);
}

export async function deleteState(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  await prisma.state.delete({ where: { id } });
  response.status(204).send();
}

export async function getAdminMinistries(_request: Request, response: Response) {
  const ministries = await prisma.ministry.findMany({
    orderBy: { name: "asc" }
  });

  response.json(ministries);
}

export async function createMinistry(request: Request, response: Response) {
  const payload = ministrySchema.parse(request.body);

  const ministry = await prisma.ministry.create({
    data: {
      ...payload,
      slug: slugify(payload.name)
    }
  });

  response.status(201).json(ministry);
}

export async function updateMinistry(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const payload = ministrySchema.parse(request.body);

  const ministry = await prisma.ministry.update({
    where: { id },
    data: {
      ...payload,
      slug: slugify(payload.name)
    }
  });

  response.json(ministry);
}

export async function deleteMinistry(request: Request, response: Response) {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  await prisma.ministry.delete({ where: { id } });
  response.status(204).send();
}
