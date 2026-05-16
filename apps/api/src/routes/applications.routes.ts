import { Router } from "express";

import {
  applicationBodySchema,
  interactionBodySchema,
  listApplicationsQuerySchema,
  reminderBodySchema,
  updateApplicationBodySchema,
} from "../modules/applications/applications.schemas.js";
import { applicationsService } from "../modules/applications/applications.service.js";

export const applicationsRoutes = Router();

applicationsRoutes.get("/", async (request, response, next) => {
  try {
    const query = listApplicationsQuerySchema.parse(request.query);
    const applications = await applicationsService.listApplications(query);

    return response.json(applications);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.post("/", async (request, response, next) => {
  try {
    const body = applicationBodySchema.parse(request.body);
    const application = await applicationsService.createApplication(body);

    return response.status(201).json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.get("/:id", async (request, response, next) => {
  try {
    const application = await applicationsService.getApplication(request.params.id);

    return response.json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = updateApplicationBodySchema.parse(request.body);
    const application = await applicationsService.updateApplication(request.params.id, body);

    return response.json(application);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.delete("/:id", async (request, response, next) => {
  try {
    await applicationsService.deleteApplication(request.params.id);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.get("/:id/interactions", async (request, response, next) => {
  try {
    const interactions = await applicationsService.listInteractions(request.params.id);

    return response.json(interactions);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.post("/:id/interactions", async (request, response, next) => {
  try {
    const body = interactionBodySchema.parse(request.body);
    const interaction = await applicationsService.createInteraction(request.params.id, body);

    return response.status(201).json(interaction);
  } catch (error) {
    return next(error);
  }
});

applicationsRoutes.post("/:id/reminders", async (request, response, next) => {
  try {
    const body = reminderBodySchema.parse(request.body);
    const reminder = await applicationsService.createReminder(request.params.id, body);

    return response.status(201).json(reminder);
  } catch (error) {
    return next(error);
  }
});
