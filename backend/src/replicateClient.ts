import { logger } from "./utils/logger.js";
import { ReplicateError } from "./errors/ReplicateError.js";

export class ReplicateClient {
  private readonly apiToken: string;
  private readonly baseUrl = "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions";

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.REPLICATE_API_TOKEN || "";
    if (!this.apiToken) {
      logger.error("ReplicateClient initialization failed: Missing API token");
      throw new ReplicateError("Missing REPLICATE_API_TOKEN", 500);
    }
    logger.info("ReplicateClient initialized");
  }

  async generateSingleIcon(prompt: string): Promise<string> {
    logger.info("Sending prompt to Replicate API", { 
      prompt: prompt,
      promptLength: prompt.length 
    });

    const requestBody = {
      input: {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        megapixels: "0.25", // 0.25 megapixels ≈ 512x512 pixels (512 * 512 = 262,144 pixels)
        output_format: "png",
        output_quality: 90,
      },
    };

    logger.info("Requesting 512x512 image from Replicate", {
      aspectRatio: "1:1",
      megapixels: "0.25",
      expectedDimensions: "512x512",
    });

    logger.debug("Replicate API request body", { 
      body: JSON.stringify(requestBody, null, 2) 
    });

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Replicate API request failed", undefined, {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new ReplicateError(
          "Replicate API request failed",
          response.status,
          errorText,
          { status: response.status }
        );
      }

      const data = (await response.json()) as {
        output?: string | string[]; // Can be single string or array
        status?: string;
        error?: string;
      };

      if (data.error) {
        logger.error("Replicate API returned error", undefined, {
          error: data.error,
          status: data.status,
        });
        throw new ReplicateError(
          `Replicate API error: ${data.error}`,
          undefined,
          data.error,
          { status: data.status }
        );
      }

      if (!data.output) {
        logger.error("Replicate returned no output");
        throw new ReplicateError("Replicate returned no output");
      }

      // Handle both single string and array responses
      const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

      if (!imageUrl || typeof imageUrl !== "string") {
        logger.error("Replicate returned invalid image URL", undefined, {
          output: data.output,
        });
        throw new ReplicateError("Replicate returned invalid image URL", undefined, undefined, {
          output: data.output,
        });
      }

      logger.debug("Icon generated successfully", { urlLength: imageUrl.length });
      return imageUrl;
    } catch (error) {
      if (error instanceof ReplicateError) {
        throw error;
      }
      logger.error("Unexpected error generating icon", error as Error);
      throw new ReplicateError(
        "Failed to generate icon",
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async generateIcons(prompts: string[]): Promise<string[]> {
    logger.info("Generating multiple icons", { count: prompts.length });

    try {
      // Generate icons in parallel for better performance
      const imagePromises = prompts.map((prompt, index) =>
        this.generateSingleIcon(prompt).catch((error) => {
          logger.error(`Failed to generate icon ${index + 1}`, error as Error);
          throw error;
        })
      );

      const images = await Promise.all(imagePromises);
      logger.info("All icons generated successfully", { count: images.length });
      return images;
    } catch (error) {
      logger.error("Failed to generate icons", error as Error, {
        promptCount: prompts.length,
      });
      throw error;
    }
  }
}
