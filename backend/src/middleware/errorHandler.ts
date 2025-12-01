import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";

export interface ErrorResponse {
  error: string;
  statusCode: number;
  context?: Record<string, unknown>;
  stack?: string;
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError) {
    logger.error(
      `AppError: ${err.message}`,
      err,
      {
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        ...err.context,
      }
    );
  } else {
    logger.error(
      `Unexpected error: ${err.message}`,
      err,
      {
        path: req.path,
        method: req.method,
      }
    );
  }

  // Prepare error response
  let statusCode = 500;
  let errorMessage = "Internal server error";
  let context: Record<string, unknown> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    context = err.context;
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }

  const errorResponse: ErrorResponse = {
    error: errorMessage,
    statusCode,
    ...(context && { context }),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

