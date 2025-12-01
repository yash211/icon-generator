import type { Request, Response, NextFunction } from "express";
import { ReplicateClient } from "../replicateClient.js";
import { PromptBuilder } from "../promptBuilder.js";
import { getStyleById, type IconStyleId } from "../styles.js";
import { logger } from "../utils/logger.js";
import { Validator } from "../utils/validation.js";
import { ValidationError } from "../errors/ValidationError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export type GenerateIconsRequest = {
  prompt: string;
  styleId: IconStyleId;
  colors?: string[];
};

export type GenerateIconsResponse = {
  images: string[];
};

export class IconController {
  private replicateClient: ReplicateClient;
  private promptBuilder: PromptBuilder;

  constructor(replicateClient: ReplicateClient, promptBuilder: PromptBuilder) {
    this.replicateClient = replicateClient;
    this.promptBuilder = promptBuilder;
    logger.info("IconController initialized");
  }

  async generateIcons(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as GenerateIconsRequest;

      logger.info("Icon generation request received", {
        prompt: body.prompt?.substring(0, 50),
        styleId: body.styleId,
        hasColors: !!body.colors,
        colors: body.colors || [],
        colorCount: body.colors?.length || 0,
      });

      // Validate input using Validator utility
      Validator.validatePrompt(body.prompt);
      Validator.validateStyleId(body.styleId);
      Validator.validateColors(body.colors);

      // Validate style exists
      const style = getStyleById(body.styleId);
      if (!style) {
        throw new NotFoundError("Icon style", body.styleId);
      }

      logger.info("Building prompts for icon generation", {
        styleId: body.styleId,
        colorCount: body.colors?.length || 0,
        colors: body.colors || "No colors provided",
      });

      // Build 4 different prompts for 4 different icons
      const prompts = [0, 1, 2, 3].map((variation) =>
        this.promptBuilder.buildSingleIconPrompt(
          body.prompt,
          style.promptTag,
          variation,
          body.colors
        )
      );

      logger.info("Prompts built successfully", {
        promptCount: prompts.length,
        firstPromptPreview: prompts[0]?.substring(0, 100),
      });

      // Generate 4 separate icons via Replicate (one per image)
      const images = await this.replicateClient.generateIcons(prompts);

      logger.info("Icons generated successfully", {
        imageCount: images.length,
      });

      // Return success response
      const result: GenerateIconsResponse = { images };
      res.json(result);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
}

