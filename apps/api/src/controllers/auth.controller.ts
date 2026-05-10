import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function login(request: AuthRequest, response: import("express").Response) {
  const credentials = loginSchema.parse(request.body);

  const admin = await prisma.adminUser.findUnique({
    where: { email: credentials.email }
  });

  if (!admin) {
    response.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);

  if (!isValid) {
    response.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const token = jwt.sign(
    {
      email: admin.email,
      role: admin.role
    },
    env.JWT_SECRET,
    {
      subject: admin.id,
      expiresIn: "8h"
    }
  );

  response.json({
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
}

export async function me(request: AuthRequest, response: import("express").Response) {
  if (!request.user) {
    response.status(401).json({ message: "Unauthenticated." });
    return;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: request.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  response.json(admin);
}
