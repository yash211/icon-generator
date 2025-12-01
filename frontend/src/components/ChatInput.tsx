import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import type { IconStyleId } from "../types";
import { ICON_STYLE_OPTIONS, COLOR_OPTIONS } from "../types";
import { colorNameToHex } from "../utils/colorConverter";

type ChatStep = "welcome" | "prompt-style" | "generating" | "complete";

type ChatInputProps = {
  currentStep: ChatStep;
  isLoading: boolean;
  onInput: (input: string, styleId?: IconStyleId, colors?: string[]) => void;
};

export default function ChatInput({
  currentStep,
  isLoading,
  onInput,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [styleId, setStyleId] = useState<IconStyleId>("pastel-flat");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");

  // Handles form submission for prompt-style with optional colors
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (currentStep === "prompt-style") {
      if (!inputValue.trim()) {
        setError("Please enter a theme");
        return;
      }

      let colors: string[] = [];
      if (selectedColor) {
        const hex = colorNameToHex(selectedColor);
        if (hex) {
          colors = [hex];
        }
      }

      onInput(inputValue.trim(), styleId, colors);
      setInputValue("");
      setSelectedColor("");
    }
  };

  // Handles Enter key press to submit form
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  if (currentStep === "generating" || currentStep === "complete") {
    return null;
  }

  if (currentStep === "prompt-style") {
    return (
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="chat-input-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter theme (e.g., Toys, Animals, Food...)"
            className="chat-input chat-input-prompt"
            disabled={isLoading}
            autoFocus
          />
          <select
            value={styleId}
            onChange={(e) => setStyleId(e.target.value as IconStyleId)}
            className="chat-select"
            disabled={isLoading}
          >
            {ICON_STYLE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              setError("");
            }}
            className="chat-select chat-select-colors"
            disabled={isLoading}
          >
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value || "default"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="chat-send-button"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner"></span>
              </span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </form>
    );
  }

  return null;
}
