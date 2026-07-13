import { createTheme, type Theme } from "@mui/material/styles";
import type { ThemeConfig } from "./themeConfigs";
import { darken, lighten } from "./colorUtils";

const FONT_STACKS: Record<ThemeConfig["fontStyle"], { body: string; heading: string }> = {
  pixel: { body: '"VT323", "Courier New", monospace', heading: '"Press Start 2P", "Courier New", monospace' },
  mono: { body: '"Courier New", monospace', heading: '"Courier New", monospace' },
  sans: {
    body: '"Inter", "Segoe UI", system-ui, sans-serif',
    heading: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
  serif: { body: '"Georgia", "Times New Roman", serif', heading: '"Georgia", "Times New Roman", serif' },
};

export function createAppTheme(config: ThemeConfig): Theme {
  const { palette, borderStyle, fontStyle } = config;
  const fonts = FONT_STACKS[fontStyle];
  const isBevel = borderStyle === "bevel";
  const isRounded = borderStyle === "rounded";

  const bevelLight = lighten(palette.panel, 0.35);
  const bevelDark = darken(palette.panel, 0.55);
  const flatBorder = lighten(palette.panel, 0.25);
  const softShadow = `${darken(palette.background, 0)}80`; // полупрозрачная тень на основе фона

  const borderRadius = isRounded ? 12 : 0;

  const outsetBevel = isBevel
    ? {
        borderTopColor: bevelLight,
        borderLeftColor: bevelLight,
        borderBottomColor: bevelDark,
        borderRightColor: bevelDark,
      }
    : {};

  const cardBorder = isBevel
    ? { borderWidth: 2, borderStyle: "solid" as const, ...outsetBevel }
    : isRounded
      ? { border: "none" }
      : { borderWidth: 1, borderStyle: "solid" as const, borderColor: flatBorder };

  const cardShadow = isRounded ? `0 4px 14px ${softShadow}` : isBevel ? `4px 4px 0 ${softShadow}` : "none";

  return createTheme({
    palette: {
      primary: { main: palette.primary, contrastText: darken(palette.background, 0.3) },
      secondary: { main: palette.secondary, contrastText: darken(palette.background, 0.3) },
      background: { default: palette.background, paper: palette.panel },
      text: { primary: palette.textPrimary, secondary: palette.textSecondary },
    },
    shape: { borderRadius },
    typography: {
      fontFamily: fonts.body,
      button: { fontFamily: fonts.heading, fontSize: fontStyle === "pixel" ? 10 : 13, fontWeight: fontStyle === "pixel" ? 400 : 600 },
      h6: { fontFamily: fonts.heading, fontWeight: fontStyle === "pixel" ? 400 : 700 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: palette.panel,
            backgroundImage: "none",
            borderBottom: isBevel || borderStyle === "flat" ? `2px solid ${bevelDark || flatBorder}` : "none",
            boxShadow: isRounded ? `0 2px 10px ${softShadow}` : "none",
          },
        },
      },
      MuiButton: {
        defaultProps: { size: "large" },
        styleOverrides: {
          root: {
            borderRadius,
            textTransform: "none",
            backgroundColor: lighten(palette.panel, 0.15),
            color: palette.textPrimary,
            padding: "10px 20px",
            fontSize: fontStyle === "pixel" ? 12 : 14,
            ...cardBorder,
            boxShadow: cardShadow,
            transition: "transform 100ms ease, box-shadow 100ms ease",
            "&:hover": {
              backgroundColor: lighten(palette.panel, 0.25),
              transform: isRounded ? "translateY(-1px)" : "translate(-1px, -1px)",
            },
          },
          outlined: cardBorder,
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: isRounded ? "50%" : borderRadius,
            backgroundColor: lighten(palette.panel, 0.15),
            padding: 10,
            ...cardBorder,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: palette.panel,
            ...cardBorder,
            boxShadow: cardShadow,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: isRounded ? 16 : 0,
            fontFamily: fonts.heading,
            fontSize: fontStyle === "pixel" ? 9 : 12,
            backgroundColor: darken(palette.panel, 0.2),
            color: palette.textPrimary,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: isBevel ? bevelLight : flatBorder,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { height: 3, backgroundColor: palette.primary },
          root: { borderBottom: `2px solid ${isBevel ? bevelDark : flatBorder}` },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: palette.textSecondary,
            fontFamily: fonts.heading,
            fontSize: fontStyle === "pixel" ? 10 : 13,
            minHeight: 48,
            "&.Mui-selected": { color: palette.primary },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius,
            backgroundColor: darken(palette.panel, 0.15),
            color: palette.textPrimary,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: isBevel ? bevelDark : flatBorder },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: palette.primary },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: palette.primary },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: palette.textSecondary, "&.Mui-focused": { color: palette.primary } },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: isRounded ? 8 : 0,
            backgroundColor: darken(palette.panel, 0.2),
          },
          bar: { borderRadius: isRounded ? 8 : 0 },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            borderRadius: "50%",
            borderWidth: isBevel ? 2 : 1,
            borderStyle: "solid",
            borderColor: isBevel ? bevelLight : flatBorder,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: isRounded ? 8 : 0,
            backgroundColor: darken(palette.panel, 0.2),
            border: `1px solid ${isBevel ? bevelLight : flatBorder}`,
            fontFamily: fonts.body,
            fontSize: 14,
            color: palette.textPrimary,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.panel,
            ...cardBorder,
            boxShadow: isBevel ? `6px 6px 0 ${softShadow}` : `0 8px 24px ${softShadow}`,
          },
        },
      },
    },
  });
}
