import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export type AuthRequest = Request & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export function authenticate(request: AuthRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Missing or invalid authorization header." });
    return;
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      role: string;
    };

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch {
    response.status(401).json({ message: "Authentication token is invalid or expired." });
  }
}
