const COLOR_NAME_TO_HEX: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#FF0000",
  green: "#008000",
  blue: "#0000FF",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FFC0CB",
  brown: "#A52A2A",
  gray: "#808080",
  grey: "#808080",
  navy: "#000080",
  teal: "#008080",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  lime: "#00FF00",
  olive: "#808000",
  maroon: "#800000",
  silver: "#C0C0C0",
  gold: "#FFD700",
  indigo: "#4B0082",
  violet: "#EE82EE",
  turquoise: "#40E0D0",
  coral: "#FF7F50",
  salmon: "#FA8072",
  khaki: "#F0E68C",
  lavender: "#E6E6FA",
  plum: "#DDA0DD",
  beige: "#F5F5DC",
  mint: "#98FB98",
  peach: "#FFE5B4",
  cream: "#FFFDD0",
  ivory: "#FFFFF0",
  tan: "#D2B48C",
  chocolate: "#7B3F00",
  crimson: "#DC143C",
  fuchsia: "#FF00FF",
  aqua: "#00FFFF",
  azure: "#F0FFFF",
  bisque: "#FFE4C4",
  burlywood: "#DEB887",
  cadetblue: "#5F9EA0",
  chartreuse: "#7FFF00",
  cornflowerblue: "#6495ED",
  darkblue: "#00008B",
  darkgreen: "#006400",
  darkred: "#8B0000",
  darkorange: "#FF8C00",
  darkviolet: "#9400D3",
  deeppink: "#FF1493",
  deepskyblue: "#00BFFF",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1E90FF",
  firebrick: "#B22222",
  forestgreen: "#228B22",
  gainsboro: "#DCDCDC",
  ghostwhite: "#F8F8FF",
  goldenrod: "#DAA520",
  greenyellow: "#ADFF2F",
  honeydew: "#F0FFF0",
  hotpink: "#FF69B4",
  indianred: "#CD5C5C",
  lightblue: "#ADD8E6",
  lightcoral: "#F08080",
  lightgreen: "#90EE90",
  lightgray: "#D3D3D3",
  lightgrey: "#D3D3D3",
  lightpink: "#FFB6C1",
  lightsalmon: "#FFA07A",
  lightseagreen: "#20B2AA",
  lightskyblue: "#87CEFA",
  lightsteelblue: "#B0C4DE",
  lightyellow: "#FFFFE0",
  limegreen: "#32CD32",
  linen: "#FAF0E6",
  mediumaquamarine: "#66CDAA",
  mediumblue: "#0000CD",
  mediumorchid: "#BA55D3",
  mediumpurple: "#9370DB",
  mediumseagreen: "#3CB371",
  mediumslateblue: "#7B68EE",
  mediumspringgreen: "#00FA9A",
  mediumturquoise: "#48D1CC",
  mediumvioletred: "#C71585",
  midnightblue: "#191970",
  mistyrose: "#FFE4E1",
  moccasin: "#FFE4B5",
  navajowhite: "#FFDEAD",
  oldlace: "#FDF5E6",
  olivedrab: "#6B8E23",
  orangered: "#FF4500",
  orchid: "#DA70D6",
  palegoldenrod: "#EEE8AA",
  palegreen: "#98FB98",
  paleturquoise: "#AFEEEE",
  palevioletred: "#DB7093",
  papayawhip: "#FFEFD5",
  peachpuff: "#FFDAB9",
  peru: "#CD853F",
  powderblue: "#B0E0E6",
  rosybrown: "#BC8F8F",
  royalblue: "#4169E1",
  saddlebrown: "#8B4513",
  sandybrown: "#F4A460",
  seagreen: "#2E8B57",
  seashell: "#FFF5EE",
  sienna: "#A0522D",
  skyblue: "#87CEEB",
  slateblue: "#6A5ACD",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#FFFAFA",
  springgreen: "#00FF7F",
  steelblue: "#4682B4",
  thistle: "#D8BFD8",
  tomato: "#FF6347",
  wheat: "#F5DEB3",
  whitesmoke: "#F5F5F5",
  yellowgreen: "#9ACD32",
};

// Converts color name or HEX code to HEX format
export function colorNameToHex(colorInput: string): string | null {
  const trimmed = colorInput.trim().toLowerCase();
  
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  const hex = COLOR_NAME_TO_HEX[trimmed];
  if (hex) {
    return hex;
  }
  
  return null;
}

// Parses comma-separated color names/HEX codes and returns valid colors and invalid ones
export function parseColors(colorInputs: string): { colors: string[]; invalid: string[] } {
  const colorStrings = colorInputs
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  
  const colors: string[] = [];
  const invalid: string[] = [];
  
  for (const colorStr of colorStrings) {
    const hex = colorNameToHex(colorStr);
    if (hex) {
      colors.push(hex);
    } else {
      invalid.push(colorStr);
    }
  }
  
  return { colors, invalid };
}
