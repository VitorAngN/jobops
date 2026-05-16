import { remindersRepository } from "./reminders.repository.js";
import type { ReminderListFilters, ReminderUpdateInput } from "./reminders.schemas.js";

export const remindersService = {
  listReminders(filters: ReminderListFilters) {
    return remindersRepository.list(filters);
  },

  updateReminder(id: string, input: ReminderUpdateInput) {
    return remindersRepository.update(id, input);
  },

  deleteReminder(id: string) {
    return remindersRepository.delete(id);
  },
};
