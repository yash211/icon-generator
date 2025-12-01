import { logger } from "./utils/logger.js";

export class PromptBuilder {
  buildSingleIconPrompt(
    userPrompt: string,
    stylePromptTag: string,
    iconVariation: number,
    colors?: string[]
  ): string {
    const trimmedPrompt = userPrompt.trim();
    
    // Create variation prompts to get different icons
    const variations = [
      `a ${trimmedPrompt} icon`,
      `a different ${trimmedPrompt} icon`,
      `another ${trimmedPrompt} icon`,
      `one more ${trimmedPrompt} icon`,
    ];
    
    const iconDescription = variations[iconVariation] || variations[0];
    
    // Build color instruction
    let colorPart = "";
    if (colors && colors.length > 0) {
      colorPart = `Use a color palette based on these hex colors: ${colors.join(", ")}.`;
      logger.debug(`Using custom colors for icon ${iconVariation + 1}`, {
        colors: colors,
        variation: iconVariation,
      });
    } else {
      logger.debug(`No colors provided for icon ${iconVariation + 1}, using default palette`, {
        variation: iconVariation,
      });
      // Don't add color instruction if no colors provided - let the model use its default
    }

    const prompt = `
A single ${iconDescription}, ${stylePromptTag}, centered composition, 512x512 square format, no text, no logos, clean white background.${colorPart ? ` ${colorPart}` : ""}
`.trim();

    return prompt;
  }
}
