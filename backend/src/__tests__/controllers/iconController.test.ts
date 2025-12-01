import type { Request, Response, NextFunction } from "express";
import { IconController } from "../../controllers/IconController.js";
import { ReplicateClient } from "../../replicateClient.js";
import { PromptBuilder } from "../../promptBuilder.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

// Mock dependencies
jest.mock("../../replicateClient.js");
jest.mock("../../promptBuilder.js");
jest.mock("../../styles.js", () => ({
  getStyleById: jest.fn(),
  ICON_STYLES: [
    {
      id: "pastel-flat",
      label: "Style 1 – Soft Pastel Flat",
      promptTag: "flat pastel icon style",
    },
  ],
}));

describe("IconController", () => {
  let controller: IconController;
  let mockReplicateClient: jest.Mocked<ReplicateClient>;
  let mockPromptBuilder: jest.Mocked<PromptBuilder>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReplicateClient = {
      generateIcons: jest.fn(),
    } as unknown as jest.Mocked<ReplicateClient>;

    mockPromptBuilder = {
      buildSingleIconPrompt: jest.fn(),
    } as unknown as jest.Mocked<PromptBuilder>;

    controller = new IconController(mockReplicateClient, mockPromptBuilder);

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe("generateIcons", () => {
    it("should successfully generate icons with valid input", async () => {
      const { getStyleById } = await import("../../styles.js");
      (getStyleById as jest.Mock).mockReturnValue({
        id: "pastel-flat",
        label: "Style 1",
        promptTag: "flat pastel icon style",
      });

      mockRequest.body = {
        prompt: "coffee",
        styleId: "pastel-flat",
        colors: ["#FF5733"],
      };

      (mockPromptBuilder.buildSingleIconPrompt as jest.Mock).mockReturnValue(
        "test prompt"
      );

      const mockImages = [
        "https://replicate.delivery/image1.png",
        "https://replicate.delivery/image2.png",
        "https://replicate.delivery/image3.png",
        "https://replicate.delivery/image4.png",
      ];

      (mockReplicateClient.generateIcons as jest.Mock).mockResolvedValue(
        mockImages
      );

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPromptBuilder.buildSingleIconPrompt).toHaveBeenCalledTimes(4);
      expect(mockReplicateClient.generateIcons).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ images: mockImages });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should call next with ValidationError for missing prompt", async () => {
      mockRequest.body = {
        styleId: "pastel-flat",
      };

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it("should call next with ValidationError for empty prompt", async () => {
      mockRequest.body = {
        prompt: "   ",
        styleId: "pastel-flat",
      };

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it("should call next with NotFoundError for invalid styleId", async () => {
      const { getStyleById } = await import("../../styles.js");
      (getStyleById as jest.Mock).mockReturnValue(undefined);

      mockRequest.body = {
        prompt: "coffee",
        styleId: "invalid-style",
      };

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it("should call next with ValidationError for invalid colors", async () => {
      const { getStyleById } = await import("../../styles.js");
      (getStyleById as jest.Mock).mockReturnValue({
        id: "pastel-flat",
        promptTag: "style",
      });

      mockRequest.body = {
        prompt: "coffee",
        styleId: "pastel-flat",
        colors: ["invalid-color"],
      };

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it("should handle Replicate API errors", async () => {
      const { getStyleById } = await import("../../styles.js");
      (getStyleById as jest.Mock).mockReturnValue({
        id: "pastel-flat",
        promptTag: "style",
      });

      mockRequest.body = {
        prompt: "coffee",
        styleId: "pastel-flat",
      };

      (mockPromptBuilder.buildSingleIconPrompt as jest.Mock).mockReturnValue(
        "test prompt"
      );

      const replicateError = new Error("API Error");
      (mockReplicateClient.generateIcons as jest.Mock).mockRejectedValue(
        replicateError
      );

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(replicateError);
    });

    it("should work without colors", async () => {
      const { getStyleById } = await import("../../styles.js");
      (getStyleById as jest.Mock).mockReturnValue({
        id: "pastel-flat",
        promptTag: "style",
      });

      mockRequest.body = {
        prompt: "coffee",
        styleId: "pastel-flat",
      };

      (mockPromptBuilder.buildSingleIconPrompt as jest.Mock).mockReturnValue(
        "test prompt"
      );

      const mockImages = ["image1.png", "image2.png", "image3.png", "image4.png"];
      (mockReplicateClient.generateIcons as jest.Mock).mockResolvedValue(
        mockImages
      );

      await controller.generateIcons(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockPromptBuilder.buildSingleIconPrompt).toHaveBeenCalledWith(
        "coffee",
        "style",
        expect.any(Number),
        undefined
      );
    });
  });
});

