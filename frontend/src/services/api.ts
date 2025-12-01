import type { GenerateIconsRequest, GenerateIconsResponse } from "../types";

const API_TIMEOUT = 60000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Gets API base URL from environment variable
const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    console.warn("VITE_API_BASE_URL not set, using default /api");
    return "/api";
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode: number;
  public context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.context = context;
  }
}

// Fetches with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408);
    }
    throw error;
  }
}

// Retries a failed request
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay);
  }
}

// Generates icons by calling the API
export async function generateIcons(
  request: GenerateIconsRequest
): Promise<GenerateIconsResponse> {
  const makeRequest = async (): Promise<GenerateIconsResponse> => {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/generate-icons`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
      API_TIMEOUT
    );

    if (!response.ok) {
      let errorMessage = "Failed to generate icons";
      let context: Record<string, unknown> | undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        context = errorData.context;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, context);
    }

    const data: GenerateIconsResponse = await response.json();

    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      throw new ApiError("Invalid response: no images received", 500);
    }

    return data;
  };

  return retryRequest(makeRequest, MAX_RETRIES, RETRY_DELAY);
}

// Checks API health
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/health`,
      { method: "GET" },
      5000
    );
    return response.ok;
  } catch {
    return false;
  }
}

