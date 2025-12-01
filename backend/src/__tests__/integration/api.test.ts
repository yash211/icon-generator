import request from "supertest";
import express, { type Express } from "express";
import cors from "cors";
import { ReplicateClient } from "../../replicateClient.js";
import { PromptBuilder } from "../../promptBuilder.js";
import { IconController } from "../../controllers/IconController.js";
import { errorHandler } from "../../middleware/errorHandler.js";
import { requestLogger } from "../../middleware/requestLogger.js";

// Mock ReplicateClient to avoid actual API calls
jest.mock("../../replicateClient.js");
jest.mock("../../promptBuilder.js");

describe("API Integration Tests", () => {
  let app: Express;
  let mockReplicateClient: jest.Mocked<ReplicateClient>;
  let mockPromptBuilder: jest.Mocked<PromptBuilder>;

  beforeAll(() => {
    process.env.REPLICATE_API_TOKEN = "test-token";

    // Create mock instances
    mockReplicateClient = {
      generateIcons: jest.fn().mockResolvedValue([
        "https://replicate.delivery/image1.png",
        "https://replicate.delivery/image2.png",
        "https://replicate.delivery/image3.png",
        "https://replicate.delivery/image4.png",
      ]),
    } as unknown as jest.Mocked<ReplicateClient>;

    mockPromptBuilder = {
      buildSingleIconPrompt: jest.fn().mockReturnValue("test prompt"),
    } as unknown as jest.Mocked<PromptBuilder>;

    // Create Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use(requestLogger);

    const iconController = new IconController(
      mockReplicateClient,
      mockPromptBuilder
    );

    app.post(
      "/api/generate-icons",
      (req, res, next) => iconController.generateIcons(req, res, next)
    );

    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app.use(errorHandler);
  });

  afterAll(() => {
    delete process.env.REPLICATE_API_TOKEN;
  });

  describe("POST /api/generate-icons", () => {
    it("should generate icons with valid request", async () => {
      const response = await request(app)
        .post("/api/generate-icons")
        .send({
          prompt: "coffee",
          styleId: "pastel-flat",
          colors: ["#FF5733"],
        })
        .expect(200);

      expect(response.body).toHaveProperty("images");
      expect(response.body.images).toHaveLength(4);
      expect(response.body.images[0]).toContain("replicate.delivery");
    });

    it("should return 400 for missing prompt", async () => {
      const response = await request(app)
        .post("/api/generate-icons")
        .send({
          styleId: "pastel-flat",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Prompt");
    });

    it("should return 400 for invalid styleId", async () => {
      const response = await request(app)
        .post("/api/generate-icons")
        .send({
          prompt: "coffee",
          styleId: "invalid-style",
        })
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid color format", async () => {
      const response = await request(app)
        .post("/api/generate-icons")
        .send({
          prompt: "coffee",
          styleId: "pastel-flat",
          colors: ["invalid-color"],
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("color");
    });

    it("should work without colors", async () => {
      const response = await request(app)
        .post("/api/generate-icons")
        .send({
          prompt: "music",
          styleId: "glossy-bubble",
        })
        .expect(200);

      expect(response.body.images).toHaveLength(4);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
    });
  });

  describe("GET /api-docs", () => {
    it("should serve Swagger UI", async () => {
      const response = await request(app).get("/api-docs").expect(200);
      expect(response.text).toContain("swagger");
    });
  });

  describe("GET /api-docs.json", () => {
    it("should return OpenAPI JSON", async () => {
      const response = await request(app)
        .get("/api-docs.json")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("openapi");
      expect(response.body).toHaveProperty("info");
    });
  });
});

