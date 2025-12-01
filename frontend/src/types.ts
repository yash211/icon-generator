export type IconStyleId =
  | "pastel-flat"
  | "glossy-bubble"
  | "minimal-line"
  | "clay-3d"
  | "playful-cartoon";

export type IconStyleOption = {
  id: IconStyleId;
  label: string;
};

export const ICON_STYLE_OPTIONS: IconStyleOption[] = [
  { id: "pastel-flat", label: "Soft Pastel Flat" },
  { id: "glossy-bubble", label: "Glossy Bubble" },
  { id: "minimal-line", label: "Minimal Line" },
  { id: "clay-3d", label: "3D Clay" },
  { id: "playful-cartoon", label: "Playful Cartoon" },
];

export type ColorOption = {
  value: string;
  label: string;
  hex: string;
};

export const COLOR_OPTIONS: ColorOption[] = [
  { value: "", label: "Default Colors", hex: "" },
  { value: "red", label: "Red", hex: "#FF0000" },
  { value: "blue", label: "Blue", hex: "#0000FF" },
  { value: "green", label: "Green", hex: "#008000" },
  { value: "yellow", label: "Yellow", hex: "#FFFF00" },
  { value: "orange", label: "Orange", hex: "#FFA500" },
  { value: "purple", label: "Purple", hex: "#800080" },
  { value: "pink", label: "Pink", hex: "#FFC0CB" },
  { value: "black", label: "Black", hex: "#000000" },
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "navy", label: "Navy", hex: "#000080" },
  { value: "teal", label: "Teal", hex: "#008080" },
  { value: "cyan", label: "Cyan", hex: "#00FFFF" },
  { value: "magenta", label: "Magenta", hex: "#FF00FF" },
  { value: "lime", label: "Lime", hex: "#00FF00" },
  { value: "brown", label: "Brown", hex: "#A52A2A" },
  { value: "gray", label: "Gray", hex: "#808080" },
  { value: "gold", label: "Gold", hex: "#FFD700" },
  { value: "indigo", label: "Indigo", hex: "#4B0082" },
  { value: "violet", label: "Violet", hex: "#EE82EE" },
];

export type GenerateIconsRequest = {
  prompt: string;
  styleId: IconStyleId;
  colors?: string[];
};

export type GenerateIconsResponse = {
  images: string[];
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: Date;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      images?: string[];
      createdAt: Date;
    }
  | {
      id: string;
      role: "system";
      content: string;
      createdAt: Date;
    };
