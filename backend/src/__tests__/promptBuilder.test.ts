import { PromptBuilder } from "../promptBuilder.js";

describe("PromptBuilder", () => {
  let promptBuilder: PromptBuilder;

  beforeEach(() => {
    promptBuilder = new PromptBuilder();
  });

  describe("buildSingleIconPrompt", () => {
    it("should build a prompt with basic parameters", () => {
      const prompt = promptBuilder.buildSingleIconPrompt(
        "coffee",
        "flat pastel icon style",
        0
      );

      expect(prompt).toContain("coffee");
      expect(prompt).toContain("flat pastel icon style");
      expect(prompt).toContain("512x512");
      expect(prompt).toContain("square format");
    });

    it("should include colors when provided", () => {
      const colors = ["#FF5733", "#33FF57"];
      const prompt = promptBuilder.buildSingleIconPrompt(
        "music",
        "glossy 3D bubble icons",
        0,
        colors
      );

      expect(prompt).toContain("#FF5733");
      expect(prompt).toContain("#33FF57");
      expect(prompt).toContain("Use a color palette based on these hex colors");
    });

    it("should not include color instruction when colors not provided", () => {
      const prompt = promptBuilder.buildSingleIconPrompt(
        "travel",
        "minimal monoline icon style",
        0
      );

      expect(prompt).not.toContain("color palette");
      expect(prompt).not.toContain("hex colors");
    });

    it("should use correct variation for each icon", () => {
      const variations = [
        "a coffee icon",
        "a different coffee icon",
        "another coffee icon",
        "one more coffee icon",
      ];

      variations.forEach((expected, index) => {
        const prompt = promptBuilder.buildSingleIconPrompt(
          "coffee",
          "style",
          index
        );
        expect(prompt).toContain(expected);
      });
    });

    it("should handle empty color array", () => {
      const prompt = promptBuilder.buildSingleIconPrompt(
        "test",
        "style",
        0,
        []
      );

      expect(prompt).not.toContain("color palette");
    });

    it("should trim user prompt", () => {
      const prompt = promptBuilder.buildSingleIconPrompt(
        "  coffee  ",
        "style",
        0
      );

      expect(prompt).toContain("a coffee icon");
      expect(prompt).not.toContain("  coffee  ");
    });
  });
});

