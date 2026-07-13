import { createTheme } from "@mui/material/styles";

// "Уютный пиксель" — игровой стиль остаётся, но теплее и мягче: тёплый
// коричнево-сливовый фон вместо чёрного подземелья, кремовый текст с
// хорошим контрастом, мягкие тени вместо резкого чёрного. Рамки — только
// у крупных карточек ("выпуклая" фаска), у мелких элементов (ячейки
// календаря, строки списков) — тонкая ненавязчивая, чтобы не создавать шум.
const BEVEL_LIGHT = "#A67C4E";
const BEVEL_DARK = "#241608";
const PANEL = "#3A2C1F";
const PANEL_DARK = "#241A12";
const SOFT_SHADOW = "rgba(20, 12, 6, 0.55)";

const outsetBevel = {
  borderTopColor: BEVEL_LIGHT,
  borderLeftColor: BEVEL_LIGHT,
  borderBottomColor: BEVEL_DARK,
  borderRightColor: BEVEL_DARK,
};

const insetBevel = {
  borderTopColor: BEVEL_DARK,
  borderLeftColor: BEVEL_DARK,
  borderBottomColor: BEVEL_LIGHT,
  borderRightColor: BEVEL_LIGHT,
};

export const theme = createTheme({
  palette: {
    primary: { main: "#F0B65C", light: "#FFD98F", dark: "#C48A2E", contrastText: "#241608" },
    secondary: { main: "#7FBF8F", light: "#A8D9B4", dark: "#4E8F60", contrastText: "#12200F" },
    error: { main: "#E08669" },
    warning: { main: "#F0B65C", contrastText: "#241608" },
    background: { default: "#241A17", paper: PANEL },
    text: { primary: "#FBF1DC", secondary: "#D9C4A0", disabled: "#7A6A55" },
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: '"VT323", "Courier New", monospace',
    button: { fontFamily: '"Press Start 2P", "Courier New", monospace', fontSize: 10 },
    h6: { fontFamily: '"Press Start 2P", "Courier New", monospace', fontWeight: 400 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: PANEL,
          backgroundImage: "none",
          borderBottom: `3px solid ${BEVEL_DARK}`,
          boxShadow: `0 3px 0 ${SOFT_SHADOW}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: "large",
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
          backgroundColor: "#4A3A28",
          padding: "10px 20px",
          fontSize: 12,
          color: "#FBF1DC",
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: `3px 3px 0 ${SOFT_SHADOW}`,
          transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
          "&:hover": {
            backgroundColor: "#5A4732",
            boxShadow: `4px 4px 0 ${SOFT_SHADOW}`,
            transform: "translate(-1px, -1px)",
          },
          "&:active": {
            ...insetBevel,
            boxShadow: `1px 1px 0 ${SOFT_SHADOW}`,
            transform: "translate(2px, 2px)",
          },
        },
        outlined: {
          borderWidth: 3,
          ...outsetBevel,
          "&:hover": { borderWidth: 3, ...outsetBevel },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "#4A3A28",
          padding: 10,
          borderWidth: 2,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: `2px 2px 0 ${SOFT_SHADOW}`,
          "&:hover": {
            backgroundColor: "#5A4732",
            transform: "translate(-1px, -1px)",
            boxShadow: `3px 3px 0 ${SOFT_SHADOW}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(58, 44, 31, 0.94)",
          borderWidth: 2,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: `4px 4px 0 ${SOFT_SHADOW}`,
          transition: "transform 100ms steps(2, end), box-shadow 100ms steps(2, end)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          fontSize: 9,
          height: 24,
          backgroundColor: PANEL_DARK,
          color: "#FBF1DC",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: BEVEL_LIGHT,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          backgroundColor: "#F0B65C",
        },
        root: {
          backgroundColor: "rgba(36, 26, 23, 0.5)",
          borderBottom: `2px solid ${BEVEL_DARK}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#D9C4A0",
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          fontSize: 10,
          minHeight: 48,
          "&.Mui-selected": {
            color: "#F0B65C",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: PANEL_DARK,
          color: "#FBF1DC",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: "#5A4732",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F0B65C",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#F0B65C",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#D9C4A0",
          "&.Mui-focused": {
            color: "#F0B65C",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: PANEL_DARK,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: BEVEL_DARK,
        },
        bar: {
          borderRadius: 0,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: "50%",
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "#5A4732",
          boxShadow: `2px 2px 0 ${SOFT_SHADOW}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: PANEL_DARK,
          border: `1px solid ${BEVEL_LIGHT}`,
          fontFamily: '"VT323", monospace',
          fontSize: 14,
          color: "#FBF1DC",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: PANEL,
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: `6px 6px 0 ${SOFT_SHADOW}`,
        },
      },
    },
  },
});

export { outsetBevel, insetBevel, BEVEL_LIGHT, BEVEL_DARK, PANEL, PANEL_DARK, SOFT_SHADOW };
