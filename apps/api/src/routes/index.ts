import { Router } from "express";

import {
  createMinistry,
  createPerson,
  createState,
  deleteMinistry,
  deletePerson,
  deleteState,
  getAdminMinistries,
  getAdminOverview,
  getAdminPeople,
  getAdminStates,
  updateMinistry,
  updatePerson,
  updateState
} from "../controllers/admin.controller.js";
import { login, me } from "../controllers/auth.controller.js";
import {
  getCategories,
  getDashboard,
  getMeta,
  getNews,
  getPeople,
  getPersonBySlug,
  getPositions,
  getTimelines
} from "../controllers/directory.controller.js";
import { getStateBySlug, getStates } from "../controllers/state.controller.js";
import { asyncHandler } from "../lib/async-handler.js";
import { authenticate } from "../middleware/auth.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "india-governance-api"
  });
});

apiRouter.post("/auth/login", asyncHandler(login));
apiRouter.get("/auth/me", authenticate, asyncHandler(me));

apiRouter.get("/dashboard", asyncHandler(getDashboard));
apiRouter.get("/meta", asyncHandler(getMeta));
apiRouter.get("/categories", asyncHandler(getCategories));
apiRouter.get("/positions", asyncHandler(getPositions));
apiRouter.get("/people", asyncHandler(getPeople));
apiRouter.get("/people/:slug", asyncHandler(getPersonBySlug));
apiRouter.get("/states", asyncHandler(getStates));
apiRouter.get("/states/:slug", asyncHandler(getStateBySlug));
apiRouter.get("/timelines", asyncHandler(getTimelines));
apiRouter.get("/news", asyncHandler(getNews));

apiRouter.get("/admin/overview", authenticate, asyncHandler(getAdminOverview));
apiRouter.get("/admin/people", authenticate, asyncHandler(getAdminPeople));
apiRouter.post("/admin/people", authenticate, asyncHandler(createPerson));
apiRouter.put("/admin/people/:id", authenticate, asyncHandler(updatePerson));
apiRouter.delete("/admin/people/:id", authenticate, asyncHandler(deletePerson));

apiRouter.get("/admin/states", authenticate, asyncHandler(getAdminStates));
apiRouter.post("/admin/states", authenticate, asyncHandler(createState));
apiRouter.put("/admin/states/:id", authenticate, asyncHandler(updateState));
apiRouter.delete("/admin/states/:id", authenticate, asyncHandler(deleteState));

apiRouter.get("/admin/ministries", authenticate, asyncHandler(getAdminMinistries));
apiRouter.post("/admin/ministries", authenticate, asyncHandler(createMinistry));
apiRouter.put("/admin/ministries/:id", authenticate, asyncHandler(updateMinistry));
apiRouter.delete("/admin/ministries/:id", authenticate, asyncHandler(deleteMinistry));
