import { ReplicateClient } from "../replicateClient.js";
import { ReplicateError } from "../errors/ReplicateError.js";

// Mock fetch globally
global.fetch = jest.fn();

describe("ReplicateClient", () => {
  const mockApiToken = "test-api-token";
  let client: ReplicateClient;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REPLICATE_API_TOKEN = mockApiToken;
    client = new ReplicateClient();
  });

  afterEach(() => {
    delete process.env.REPLICATE_API_TOKEN;
  });

  describe("constructor", () => {
    it("should initialize with API token from environment", () => {
      expect(() => new ReplicateClient()).not.toThrow();
    });

    it("should initialize with provided API token", () => {
      expect(() => new ReplicateClient("custom-token")).not.toThrow();
    });

    it("should throw ReplicateError when API token is missing", () => {
      delete process.env.REPLICATE_API_TOKEN;
      expect(() => new ReplicateClient()).toThrow(ReplicateError);
    });
  });

  describe("generateSingleIcon", () => {
    const mockPrompt = "test prompt";
    const mockImageUrl = "https://replicate.delivery/pbxt/test-image.png";

    it("should successfully generate an icon", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: mockImageUrl,
        }),
      });

      const result = await client.generateSingleIcon(mockPrompt);

      expect(result).toBe(mockImageUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiToken}`,
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining(mockPrompt),
        })
      );
    });

    it("should handle array output format", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: [mockImageUrl],
        }),
      });

      const result = await client.generateSingleIcon(mockPrompt);
      expect(result).toBe(mockImageUrl);
    });

    it("should throw ReplicateError when API request fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "API Error",
      });

      await expect(client.generateSingleIcon(mockPrompt)).rejects.toThrow(
        ReplicateError
      );
    });

    it("should throw ReplicateError when API returns error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          error: "Invalid prompt",
        }),
      });

      await expect(client.generateSingleIcon(mockPrompt)).rejects.toThrow(
        ReplicateError
      );
    });

    it("should throw ReplicateError when no output returned", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(client.generateSingleIcon(mockPrompt)).rejects.toThrow(
        ReplicateError
      );
    });

    it("should include correct request parameters", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          output: mockImageUrl,
        }),
      });

      await client.generateSingleIcon(mockPrompt);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.input).toMatchObject({
        prompt: mockPrompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        megapixels: "0.25",
        output_format: "png",
        output_quality: 90,
      });
    });
  });

  describe("generateIcons", () => {
    const mockPrompts = ["prompt1", "prompt2", "prompt3", "prompt4"];
    const mockUrls = [
      "https://replicate.delivery/image1.png",
      "https://replicate.delivery/image2.png",
      "https://replicate.delivery/image3.png",
      "https://replicate.delivery/image4.png",
    ];

    it("should generate multiple icons in parallel", async () => {
      mockPrompts.forEach((_, index) => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: mockUrls[index],
          }),
        });
      });

      const results = await client.generateIcons(mockPrompts);

      expect(results).toHaveLength(4);
      expect(results).toEqual(mockUrls);
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it("should throw error if any icon generation fails", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ output: mockUrls[0] }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Error",
          text: async () => "Failed",
        });

      await expect(client.generateIcons(mockPrompts.slice(0, 2))).rejects.toThrow();
    });
  });
});

