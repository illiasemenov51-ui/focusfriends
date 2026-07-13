export type BorderStyle = "bevel" | "flat" | "rounded";
export type FontStyle = "pixel" | "mono" | "sans" | "serif";
export type BackgroundPattern = "warm-noise" | "checkerboard" | "scanlines" | "stone" | "dots" | "waves" | "none";

export interface ThemeConfig {
  id: string;
  name: string;
  borderStyle: BorderStyle;
  fontStyle: FontStyle;
  backgroundPattern: BackgroundPattern;
  palette: {
    primary: string;
    secondary: string;
    background: string;
    panel: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const THEME_CONFIGS: ThemeConfig[] = [
  {
    id: "warm-pixel",
    name: "Тёплый пиксель",
    borderStyle: "bevel",
    fontStyle: "pixel",
    backgroundPattern: "warm-noise",
    palette: {
      primary: "#F0B65C",
      secondary: "#7FBF8F",
      background: "#241A17",
      panel: "#3A2C1F",
      textPrimary: "#FBF1DC",
      textSecondary: "#D9C4A0",
    },
  },
  {
    id: "chess",
    name: "Шахматы",
    borderStyle: "flat",
    fontStyle: "serif",
    backgroundPattern: "checkerboard",
    palette: {
      primary: "#C9A24B",
      secondary: "#8B3A3A",
      background: "#1B1B1B",
      panel: "#232323",
      textPrimary: "#F0F0EA",
      textSecondary: "#B7B4AA",
    },
  },
  {
    id: "neon",
    name: "Неон",
    borderStyle: "bevel",
    fontStyle: "pixel",
    backgroundPattern: "scanlines",
    palette: {
      primary: "#39FF14",
      secondary: "#FF206E",
      background: "#0B0E14",
      panel: "#141A24",
      textPrimary: "#E9F3E6",
      textSecondary: "#8FB39A",
    },
  },
  {
    id: "pastel",
    name: "Пастель",
    borderStyle: "rounded",
    fontStyle: "sans",
    backgroundPattern: "dots",
    palette: {
      primary: "#F2A6B2",
      secondary: "#A6C8F0",
      background: "#FAF3F5",
      panel: "#FFFFFF",
      textPrimary: "#4A3F45",
      textSecondary: "#8A7A80",
    },
  },
  {
    id: "midnight",
    name: "Тёмный минимализм",
    borderStyle: "flat",
    fontStyle: "sans",
    backgroundPattern: "none",
    palette: {
      primary: "#6C8CFF",
      secondary: "#54D6B5",
      background: "#111318",
      panel: "#1A1D24",
      textPrimary: "#EDEFF4",
      textSecondary: "#9AA0AC",
    },
  },
  {
    id: "forest",
    name: "Лес",
    borderStyle: "bevel",
    fontStyle: "pixel",
    backgroundPattern: "stone",
    palette: {
      primary: "#8FBF5C",
      secondary: "#C97B3F",
      background: "#1B2117",
      panel: "#28331F",
      textPrimary: "#EAF2E0",
      textSecondary: "#AABF98",
    },
  },
  {
    id: "ocean",
    name: "Океан",
    borderStyle: "rounded",
    fontStyle: "sans",
    backgroundPattern: "waves",
    palette: {
      primary: "#4FB6C9",
      secondary: "#F2C572",
      background: "#0E2430",
      panel: "#123240",
      textPrimary: "#E4F5F8",
      textSecondary: "#9AC3CE",
    },
  },
  {
    id: "terminal",
    name: "Ретро-терминал",
    borderStyle: "flat",
    fontStyle: "mono",
    backgroundPattern: "scanlines",
    palette: {
      primary: "#33FF66",
      secondary: "#33FF66",
      background: "#050805",
      panel: "#0A100A",
      textPrimary: "#33FF66",
      textSecondary: "#1F9940",
    },
  },
  {
    id: "sakura",
    name: "Сакура",
    borderStyle: "rounded",
    fontStyle: "serif",
    backgroundPattern: "dots",
    palette: {
      primary: "#E8A0B4",
      secondary: "#7FA88A",
      background: "#241A1E",
      panel: "#332329",
      textPrimary: "#F7E9EC",
      textSecondary: "#C9A8B0",
    },
  },
  {
    id: "royal",
    name: "Королевский",
    borderStyle: "bevel",
    fontStyle: "serif",
    backgroundPattern: "none",
    palette: {
      primary: "#D4AF37",
      secondary: "#8E44AD",
      background: "#1A1225",
      panel: "#271B36",
      textPrimary: "#F2E9D8",
      textSecondary: "#B7A6C9",
    },
  },
];

export const DEFAULT_THEME_ID = "warm-pixel";
