import { AppError } from "./AppError.js";

export class ReplicateError extends AppError {
  constructor(
    message: string,
    statusCode?: number,
    originalError?: string,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      statusCode || 502,
      true,
      {
        ...context,
        ...(originalError && { originalError }),
      }
    );
    this.name = "ReplicateError";
  }
}

