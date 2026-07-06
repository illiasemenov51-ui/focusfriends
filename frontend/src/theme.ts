import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#39FF14", light: "#8DFF7A", dark: "#18B50B", contrastText: "#0B0E14" },
    secondary: { main: "#FF206E", light: "#FF6C9F", dark: "#B80F49", contrastText: "#FFFFFF" },
    warning: { main: "#FFD23F", contrastText: "#0B0E14" },
    background: { default: "#0B0E14", paper: "#141A24" },
    text: { primary: "#E9F3E6", secondary: "#8FB39A", disabled: "#54605A" },
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
          backgroundColor: "#141A24",
          backgroundImage: "none",
          borderBottom: "3px solid #39FF14",
          boxShadow: "0 4px 0 #000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
          border: "2px solid #0B0E14",
          boxShadow: "3px 3px 0 #000",
          transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
          "&:hover": {
            boxShadow: "5px 5px 0 #000",
            transform: "translate(-2px, -2px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#141A24",
          border: "3px solid #263241",
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
          borderWidth: 2,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          backgroundColor: "#39FF14",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#8FB39A",
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          fontSize: 10,
          minHeight: 44,
          "&.Mui-selected": {
            color: "#39FF14",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "#0B0E14",
          color: "#E9F3E6",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: "#263241",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#39FF14",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#39FF14",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#8FB39A",
          "&.Mui-focused": {
            color: "#39FF14",
          },
        },
      },
    },
  },
});
