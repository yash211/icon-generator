import type { IconStyleId } from "../types";
import { ICON_STYLE_OPTIONS } from "../types";

// Validates prompt input
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  const trimmed = prompt.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Please enter a theme" };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: "Theme must be at least 2 characters" };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: "Theme must be less than 100 characters" };
  }
  
  return { valid: true };
}

// Validates style ID
export function validateStyleId(styleId: string | undefined): {
  valid: boolean;
  error?: string;
  validStyleId?: IconStyleId;
} {
  if (!styleId) {
    return { valid: false, error: "Please select a style" };
  }
  
  const isValid = ICON_STYLE_OPTIONS.some((option) => option.id === styleId);
  
  if (!isValid) {
    return { valid: false, error: "Invalid style selected" };
  }
  
  return { valid: true, validStyleId: styleId as IconStyleId };
}

// Validates color array
export function validateColors(colors: string[]): {
  valid: boolean;
  error?: string;
  validColors?: string[];
} {
  if (colors.length === 0) {
    return { valid: true, validColors: [] };
  }
  
  const hexPattern = /^#([A-Fa-f0-9]{6})$/;
  const validColors: string[] = [];
  const invalidColors: string[] = [];
  
  for (const color of colors) {
    if (hexPattern.test(color)) {
      validColors.push(color);
    } else {
      invalidColors.push(color);
    }
  }
  
  if (invalidColors.length > 0) {
    return {
      valid: false,
      error: `Invalid color format: ${invalidColors.join(", ")}. Use HEX format (e.g., #FF5733)`,
    };
  }
  
  if (validColors.length > 5) {
    return {
      valid: false,
      error: "Maximum 5 colors allowed",
    };
  }
  
  return { valid: true, validColors };
}

// Validates complete request
export function validateRequest(
  prompt: string,
  styleId: string | undefined,
  colors: string[]
): {
  valid: boolean;
  errors: string[];
  validated?: {
    prompt: string;
    styleId: IconStyleId;
    colors: string[];
  };
} {
  const errors: string[] = [];
  
  const promptValidation = validatePrompt(prompt);
  if (!promptValidation.valid) {
    errors.push(promptValidation.error!);
  }
  
  const styleValidation = validateStyleId(styleId);
  if (!styleValidation.valid) {
    errors.push(styleValidation.error!);
  }
  
  const colorsValidation = validateColors(colors);
  if (!colorsValidation.valid) {
    errors.push(colorsValidation.error!);
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    validated: {
      prompt: prompt.trim(),
      styleId: styleValidation.validStyleId!,
      colors: colorsValidation.validColors || [],
    },
  };
}

