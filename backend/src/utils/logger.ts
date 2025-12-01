type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    // Set log level from environment or default to 'info'
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    this.logLevel = envLogLevel || "info";
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["error", "warn", "info", "debug"];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      formatted += ` ${JSON.stringify(context)}`;
    }

    if (error) {
      formatted += `\nError: ${error.message}`;
      if (error.stack) {
        formatted += `\nStack: ${error.stack}`;
      }
    }

    return formatted;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    const formatted = this.formatMessage(entry);

    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
    }
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log("error", message, context, error);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

