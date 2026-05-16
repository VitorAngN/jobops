import { describe, expect, it } from "vitest";

import { buildPaginationMeta, normalizePagination } from "./pagination.js";

describe("pagination", () => {
  it("normalizes invalid pagination input", () => {
    expect(normalizePagination({ page: -3, pageSize: 200 })).toEqual({
      page: 1,
      pageSize: 100,
      skip: 0,
      take: 100,
    });
  });

  it("builds pagination metadata", () => {
    expect(buildPaginationMeta(45, 2, 20)).toEqual({
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
