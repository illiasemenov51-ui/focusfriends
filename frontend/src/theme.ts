import { createTheme } from "@mui/material/styles";

// Классический Terraria-инвентарь: "выпуклая" рамка (светлый край сверху-слева,
// тёмный снизу-справа) для кнопок/слотов, и "вдавленная" (наоборот) для
// панелей-контейнеров — имитирует объём в 1 пиксель без градиентов.
const BEVEL_LIGHT = "#8A6B3E";
const BEVEL_DARK = "#0D0A06";
const STONE = "#2B2118";
const STONE_DARK = "#1A140C";

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
    primary: { main: "#D9A441", light: "#F0C97A", dark: "#9C731F", contrastText: "#1A140C" },
    secondary: { main: "#C1443B", light: "#E17870", dark: "#832019", contrastText: "#F0E4C8" },
    warning: { main: "#7CB342", contrastText: "#1A140C" },
    background: { default: "#100C08", paper: STONE },
    text: { primary: "#F0E4C8", secondary: "#B8A278", disabled: "#5A5040" },
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
          backgroundColor: STONE,
          backgroundImage: "none",
          borderBottom: `4px solid ${STONE_DARK}`,
          boxShadow: "0 4px 0 #000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
          backgroundColor: "#3D3021",
          color: "#F0E4C8",
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: "3px 3px 0 #000",
          transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
          "&:hover": {
            backgroundColor: "#4A3B2A",
            boxShadow: "5px 5px 0 #000",
            transform: "translate(-2px, -2px)",
          },
          "&:active": {
            ...insetBevel,
            boxShadow: "1px 1px 0 #000",
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
          backgroundColor: "#3D3021",
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: "2px 2px 0 #000",
          "&:hover": {
            backgroundColor: "#4A3B2A",
            transform: "translate(-1px, -1px)",
            boxShadow: "3px 3px 0 #000",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(43, 33, 24, 0.94)",
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: "5px 5px 0 #000",
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
          backgroundColor: STONE_DARK,
          color: "#F0E4C8",
          borderWidth: 2,
          borderStyle: "solid",
          ...outsetBevel,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          backgroundColor: "#D9A441",
        },
        root: {
          backgroundColor: "rgba(26, 20, 12, 0.6)",
          borderBottom: `3px solid ${STONE_DARK}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#B8A278",
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          fontSize: 10,
          minHeight: 48,
          "&.Mui-selected": {
            color: "#D9A441",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: STONE_DARK,
          color: "#F0E4C8",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 3,
            borderColor: BEVEL_DARK,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D9A441",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D9A441",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#B8A278",
          "&.Mui-focused": {
            color: "#D9A441",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: STONE_DARK,
          borderWidth: 2,
          borderStyle: "solid",
          ...insetBevel,
        },
        bar: {
          borderRadius: 0,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          borderWidth: 3,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: "2px 2px 0 #000",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: STONE_DARK,
          border: `2px solid ${BEVEL_LIGHT}`,
          fontFamily: '"VT323", monospace',
          fontSize: 14,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: STONE,
          borderWidth: 4,
          borderStyle: "solid",
          ...outsetBevel,
          boxShadow: "8px 8px 0 #000",
        },
      },
    },
  },
});

export { outsetBevel, insetBevel, BEVEL_LIGHT, BEVEL_DARK, STONE, STONE_DARK };
