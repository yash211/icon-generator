import { Validator } from "../../utils/validation.js";
import { ValidationError } from "../../errors/ValidationError.js";

describe("Validator", () => {
  describe("isValidHexColor", () => {
    it("should return true for valid hex colors", () => {
      expect(Validator.isValidHexColor("#FF5733")).toBe(true);
      expect(Validator.isValidHexColor("#000000")).toBe(true);
      expect(Validator.isValidHexColor("#FFFFFF")).toBe(true);
      expect(Validator.isValidHexColor("#abc123")).toBe(true);
      expect(Validator.isValidHexColor("#ABC123")).toBe(true);
    });

    it("should return false for invalid hex colors", () => {
      expect(Validator.isValidHexColor("FF5733")).toBe(false); // Missing #
      expect(Validator.isValidHexColor("#FF5")).toBe(false); // Too short
      expect(Validator.isValidHexColor("#GGGGGG")).toBe(false); // Invalid chars
      expect(Validator.isValidHexColor("#FF57333")).toBe(false); // Too long
      expect(Validator.isValidHexColor("")).toBe(false); // Empty
    });
  });

  describe("validatePrompt", () => {
    it("should not throw for valid prompts", () => {
      expect(() => Validator.validatePrompt("coffee")).not.toThrow();
      expect(() => Validator.validatePrompt("music icons")).not.toThrow();
      expect(() => Validator.validatePrompt("   travel   ")).not.toThrow();
    });

    it("should throw ValidationError for invalid prompts", () => {
      expect(() => Validator.validatePrompt("")).toThrow(ValidationError);
      expect(() => Validator.validatePrompt("   ")).toThrow(ValidationError);
      expect(() => Validator.validatePrompt(null as unknown as string)).toThrow(
        ValidationError
      );
      expect(() => Validator.validatePrompt(undefined as unknown as string)).toThrow(
        ValidationError
      );
      expect(() => Validator.validatePrompt(123 as unknown as string)).toThrow(
        ValidationError
      );
    });
  });

  describe("validateStyleId", () => {
    it("should not throw for valid styleId", () => {
      expect(() => Validator.validateStyleId("pastel-flat")).not.toThrow();
      expect(() => Validator.validateStyleId("glossy-bubble")).not.toThrow();
    });

    it("should throw ValidationError for invalid styleId", () => {
      expect(() => Validator.validateStyleId("")).toThrow(ValidationError);
      expect(() => Validator.validateStyleId(null as unknown as string)).toThrow(
        ValidationError
      );
      expect(() => Validator.validateStyleId(123 as unknown as string)).toThrow(
        ValidationError
      );
    });
  });

  describe("validateColors", () => {
    it("should not throw for valid color arrays", () => {
      expect(() => Validator.validateColors(["#FF5733", "#33FF57"])).not.toThrow();
      expect(() => Validator.validateColors([])).not.toThrow();
      expect(() => Validator.validateColors(undefined)).not.toThrow();
    });

    it("should throw ValidationError for invalid color arrays", () => {
      expect(() => Validator.validateColors("not an array" as unknown as string[])).toThrow(
        ValidationError
      );
      expect(() => Validator.validateColors(["#FF5733", "invalid"])).toThrow(
        ValidationError
      );
      expect(() => Validator.validateColors(["#FF5"])).toThrow(ValidationError);
      expect(() => Validator.validateColors([123 as unknown as string])).toThrow(
        ValidationError
      );
    });
  });
});

