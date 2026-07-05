import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#5B5FEF", light: "#8A8DF5", dark: "#4245C4" },
    secondary: { main: "#FF7A59", light: "#FF9B80", dark: "#E65A38" },
    background: { default: "#F7F7FB" },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 700 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundImage: "linear-gradient(135deg, #5B5FEF 0%, #7C6FF0 100%)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
