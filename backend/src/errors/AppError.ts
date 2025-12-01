export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (context !== undefined) {
      this.context = context;
    }

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.message,
      statusCode: this.statusCode,
      ...(this.context && { context: this.context }),
    };
  }
}

