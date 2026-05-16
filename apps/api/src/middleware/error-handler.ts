import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "../shared/http-errors.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "ValidationError",
      issues: error.issues,
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return response.status(404).json({
      error: "NotFound",
      message: "Resource not found.",
    });
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return response.status(503).json({
      error: "DatabaseUnavailable",
      message: "Database is unavailable. Start PostgreSQL and run the Prisma migrations.",
    });
  }

  console.error(error);

  return response.status(500).json({
    error: "InternalServerError",
    message: "Unexpected server error.",
  });
};
