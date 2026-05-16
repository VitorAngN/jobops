import { NotFoundError } from "../../shared/http-errors.js";
import { withLifecycleDefaults } from "./application-lifecycle.js";
import { applicationsRepository } from "./applications.repository.js";
import type {
  ApplicationCreateInput,
  ApplicationListFilters,
  ApplicationUpdateInput,
  InteractionCreateInput,
  InteractionUpdateInput,
  ReminderCreateInput,
} from "./applications.schemas.js";

export const applicationsService = {
  listApplications(filters: ApplicationListFilters) {
    return applicationsRepository.list(filters);
  },

  async getApplication(id: string) {
    const application = await applicationsRepository.findById(id);

    if (!application) {
      throw new NotFoundError("Application");
    }

    return application;
  },

  createApplication(input: ApplicationCreateInput) {
    return applicationsRepository.create(withLifecycleDefaults(input));
  },

  updateApplication(id: string, input: ApplicationUpdateInput) {
    return applicationsRepository.update(id, withLifecycleDefaults(input));
  },

  deleteApplication(id: string) {
    return applicationsRepository.delete(id);
  },

  async listInteractions(applicationId: string) {
    await this.getApplication(applicationId);
    return applicationsRepository.listInteractions(applicationId);
  },

  async createInteraction(applicationId: string, input: InteractionCreateInput) {
    await this.getApplication(applicationId);
    return applicationsRepository.createInteraction(applicationId, input);
  },

  updateInteraction(id: string, input: InteractionUpdateInput) {
    return applicationsRepository.updateInteraction(id, input);
  },

  deleteInteraction(id: string) {
    return applicationsRepository.deleteInteraction(id);
  },

  async createReminder(applicationId: string, input: ReminderCreateInput) {
    await this.getApplication(applicationId);
    return applicationsRepository.createReminder(applicationId, input);
  },
};
