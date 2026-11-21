import type { DiscoverySource } from "@prisma/client";

import { ashby, greenhouse, lever, smartrecruiters } from "./ats.js";
import { github } from "./github.js";
import { gupy } from "./gupy.js";
import { himalayas } from "./himalayas.js";
import { remotive } from "./remotive.js";
import { solides } from "./solides.js";
import type { JobSource } from "./types.js";

export const SOURCES: Record<DiscoverySource, JobSource> = {
  GUPY: gupy,
  GREENHOUSE: greenhouse,
  LEVER: lever,
  ASHBY: ashby,
  REMOTIVE: remotive,
  SOLIDES: solides,
  HIMALAYAS: himalayas,
  GITHUB: github,
  SMARTRECRUITERS: smartrecruiters,
};

export type { ExternalJob, JobSource, SearchInput } from "./types.js";
