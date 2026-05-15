import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "ValidationError",
      issues: error.issues,
    });
  }

  console.error(error);

  return response.status(500).json({
    error: "InternalServerError",
    message: "Unexpected server error.",
  });
};

