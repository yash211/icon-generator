import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, 400, true, {
      field,
      value,
    });
    this.name = "ValidationError";
  }
}

