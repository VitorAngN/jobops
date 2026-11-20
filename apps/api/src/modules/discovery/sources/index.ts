import type { DiscoverySource } from "@prisma/client";

import { ashby, greenhouse, lever } from "./ats.js";
import { gupy } from "./gupy.js";
import { remotive } from "./remotive.js";
import type { JobSource } from "./types.js";

export const SOURCES: Record<DiscoverySource, JobSource> = {
  GUPY: gupy,
  GREENHOUSE: greenhouse,
  LEVER: lever,
  ASHBY: ashby,
  REMOTIVE: remotive,
};

export type { ExternalJob, JobSource, SearchInput } from "./types.js";
