export type IconStyleId =
  | "pastel-flat"
  | "glossy-bubble"
  | "minimal-line"
  | "clay-3d"
  | "playful-cartoon";

export type IconStyle = {
  id: IconStyleId;
  label: string;
  promptTag: string;
};

export const ICON_STYLES: IconStyle[] = [
  {
    id: "pastel-flat",
    label: "Style 1 – Soft Pastel Flat",
    promptTag:
      "flat pastel icon style, soft pastel colors, smooth vector shapes, minimal detail, no text, clean white background",
  },
  {
    id: "glossy-bubble",
    label: "Style 2 – Glossy Bubble",
    promptTag:
      "glossy 3D bubble icons, soft reflections and highlights, rounded shapes, vibrant colors, no text, clean white background",
  },
  {
    id: "minimal-line",
    label: "Style 3 – Minimal Line",
    promptTag:
      "minimal monoline icon style, thin outlines, simple forms, subtle accent colors, no text, white background",
  },
  {
    id: "clay-3d",
    label: "Style 4 – 3D Clay",
    promptTag:
      "3D clay icon style, soft clay texture, rounded forms, studio lighting, no text, white background",
  },
  {
    id: "playful-cartoon",
    label: "Style 5 – Playful Cartoon",
    promptTag:
      "playful cartoon icon style, bold outlines, exaggerated shapes, bright colors, no text, flat white background",
  },
];

export function getStyleById(id: IconStyleId): IconStyle | undefined {
  return ICON_STYLES.find((s) => s.id === id);
}

