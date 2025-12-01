/**
 * Icon Generator API - TypeScript Type Definitions
 * 
 * Copy these types into your frontend project for type safety
 */

// ============================================
// Request Types
// ============================================

export type IconStyleId =
  | "pastel-flat"
  | "glossy-bubble"
  | "minimal-line"
  | "clay-3d"
  | "playful-cartoon";

export interface GenerateIconsRequest {
  /** The theme or subject for the icon set (e.g., "coffee", "music", "travel") */
  prompt: string;
  /** The visual style for the icons */
  styleId: IconStyleId;
  /** Optional array of hex color codes (format: #RRGGBB) */
  colors?: string[];
}

// ============================================
// Response Types
// ============================================

export interface GenerateIconsResponse {
  /** Array of 4 image URLs (URIs). Each URL points to a generated icon image. */
  images: string[];
}

export interface HealthCheckResponse {
  /** Always "ok" when server is running */
  status: "ok";
  /** Current server timestamp in ISO format */
  timestamp: string;
  /** Server uptime in seconds */
  uptime: number;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  /** Error message describing what went wrong */
  error: string;
  /** HTTP status code */
  statusCode: number;
  /** Optional additional context about the error */
  context?: Record<string, unknown>;
  /** Stack trace (only in development mode) */
  stack?: string;
}

// ============================================
// Style Information
// ============================================

export interface IconStyle {
  id: IconStyleId;
  label: string;
  description: string;
}

export const ICON_STYLES: IconStyle[] = [
  {
    id: "pastel-flat",
    label: "Style 1 – Soft Pastel Flat",
    description: "Flat pastel icon style, soft pastel colors, smooth vector shapes",
  },
  {
    id: "glossy-bubble",
    label: "Style 2 – Glossy Bubble",
    description: "Glossy 3D bubble icons, soft reflections and highlights",
  },
  {
    id: "minimal-line",
    label: "Style 3 – Minimal Line",
    description: "Minimal monoline icon style, thin outlines, simple forms",
  },
  {
    id: "clay-3d",
    label: "Style 4 – 3D Clay",
    description: "3D clay icon style, soft clay texture, rounded forms",
  },
  {
    id: "playful-cartoon",
    label: "Style 5 – Playful Cartoon",
    description: "Playful cartoon icon style, bold outlines, exaggerated shapes",
  },
];

// ============================================
// API Client Helper
// ============================================

export class IconGeneratorAPI {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:4000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a set of 4 icons
   * @param request - Icon generation request parameters
   * @returns Promise resolving to array of 4 image URLs
   * @throws {Error} If the API request fails
   */
  async generateIcons(
    request: GenerateIconsRequest
  ): Promise<GenerateIconsResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate-icons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to generate icons");
    }

    return response.json();
  }

  /**
   * Check if the API server is healthy
   * @returns Promise resolving to health check response
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate hex color format
 * @param color - Color string to validate
 * @returns true if valid hex color, false otherwise
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/i.test(color);
}

/**
 * Validate icon style ID
 * @param styleId - Style ID to validate
 * @returns true if valid style ID, false otherwise
 */
export function isValidStyleId(styleId: string): styleId is IconStyleId {
  return ICON_STYLES.some((style) => style.id === styleId);
}

