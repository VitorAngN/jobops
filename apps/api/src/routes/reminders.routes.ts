import { Router } from "express";

import { listRemindersQuerySchema, updateReminderBodySchema } from "../modules/reminders/reminders.schemas.js";
import { remindersService } from "../modules/reminders/reminders.service.js";

export const remindersRoutes = Router();

remindersRoutes.get("/", async (request, response, next) => {
  try {
    const query = listRemindersQuerySchema.parse(request.query);
    const reminders = await remindersService.listReminders(query);

    return response.json(reminders);
  } catch (error) {
    return next(error);
  }
});

remindersRoutes.patch("/:id", async (request, response, next) => {
  try {
    const body = updateReminderBodySchema.parse(request.body);
    const reminder = await remindersService.updateReminder(request.params.id, body);

    return response.json(reminder);
  } catch (error) {
    return next(error);
  }
});

remindersRoutes.delete("/:id", async (request, response, next) => {
  try {
    await remindersService.deleteReminder(request.params.id);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});
