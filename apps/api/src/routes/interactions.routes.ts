import { Router } from "express";

import { updateInteractionBodySchema } from "../modules/applications/applications.schemas.js";
import { applicationsService } from "../modules/applications/applications.service.js";

export const interactionsRoutes = Router();

interactionsRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = updateInteractionBodySchema.parse(request.body);
    const interaction = await applicationsService.updateInteraction(request.params.id, body);

    return response.json(interaction);
  } catch (error) {
    return next(error);
  }
});

interactionsRoutes.delete("/:id", async (request, response, next) => {
  try {
    await applicationsService.deleteInteraction(request.params.id);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});
