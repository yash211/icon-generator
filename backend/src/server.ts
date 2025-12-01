import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { ReplicateClient } from "./replicateClient.js";
import { PromptBuilder } from "./promptBuilder.js";
import { IconController } from "./controllers/IconController.js";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { AppError } from "./errors/AppError.js";

export class Server {
  private app: Express;
  private port: number;
  private replicateClient: ReplicateClient;
  private promptBuilder: PromptBuilder;
  private iconController: IconController;

  constructor() {
    logger.info("Initializing server...");

    // Validate environment variables
    if (!process.env.REPLICATE_API_TOKEN) {
      logger.error("Missing REPLICATE_API_TOKEN environment variable");
      logger.error("Please set REPLICATE_API_TOKEN before starting the server");
      process.exit(1);
    }

    this.port = Number(process.env.PORT) || 4000;
    this.app = express();

    // Initialize dependencies
    try {
      this.replicateClient = new ReplicateClient();
      this.promptBuilder = new PromptBuilder();
      this.iconController = new IconController(
        this.replicateClient,
        this.promptBuilder
      );
    } catch (error) {
      logger.error("Failed to initialize dependencies", error as Error);
      throw error;
    }

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwagger();
    this.setupErrorHandling();

    logger.info("Server initialized successfully");
  }

  private setupMiddleware(): void {
    // Request logging middleware (should be first)
    this.app.use(requestLogger);

    // CORS middleware
    this.app.use(cors());

    // JSON body parser
    this.app.use(express.json());

    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private setupRoutes(): void {
    this.app.post(
      "/api/generate-icons",
      (req, res, next) => this.iconController.generateIcons(req, res, next)
    );
  }

  private setupSwagger(): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get("/api-docs.json", (req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response, next) => {
      const error = new AppError(
        `Route ${req.method} ${req.path} not found`,
        404
      );
      next(error);
    });

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info("Server started successfully", {
        port: this.port,
        environment: process.env.NODE_ENV || "development",
        logLevel: process.env.LOG_LEVEL || "info",
      });
      logger.info(`Server listening on port ${this.port}`);
      logger.info(`Swagger docs available at http://localhost:${this.port}/api-docs`);
    });
  }
}

// Start the server
const server = new Server();
server.start();
