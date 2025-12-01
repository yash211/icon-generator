import { ValidationError } from "../errors/ValidationError.js";

export class Validator {
  static isValidHexColor(color: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(color);
  }

  static validatePrompt(prompt: unknown): asserts prompt is string {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new ValidationError("Prompt is required and must be a non-empty string", "prompt", prompt);
    }
  }

  static validateStyleId(styleId: unknown): asserts styleId is string {
    if (!styleId || typeof styleId !== "string") {
      throw new ValidationError("styleId is required and must be a string", "styleId", styleId);
    }
  }

  static validateColors(colors: unknown): asserts colors is string[] | undefined {
    if (colors === undefined) {
      return; // Optional field
    }

    if (!Array.isArray(colors)) {
      throw new ValidationError("colors must be an array", "colors", colors);
    }

    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      if (typeof color !== "string") {
        throw new ValidationError(
          `colors[${i}] must be a string`,
          `colors[${i}]`,
          color
        );
      }

      if (!this.isValidHexColor(color)) {
        throw new ValidationError(
          `colors[${i}] must be a valid hex color (format: #RRGGBB)`,
          `colors[${i}]`,
          color
        );
      }
    }
  }
}

