import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with identifier '${identifier}' not found`
        : `${resource} not found`,
      404,
      true,
      {
        resource,
        ...(identifier && { identifier }),
      }
    );
    this.name = "NotFoundError";
  }
}

