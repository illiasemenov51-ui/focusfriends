import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DEFAULT_THEME_ID, THEME_CONFIGS, type ThemeConfig } from "./themeConfigs";
import { createAppTheme } from "./createAppTheme";
import { darken, lighten } from "./colorUtils";

const STORAGE_KEY = "focusfriends.themeId";

interface AppThemeContextValue {
  themeId: string;
  setThemeId: (id: string) => void;
  themes: ThemeConfig[];
  currentConfig: ThemeConfig;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEME_CONFIGS.some((t) => t.id === stored) ? stored! : DEFAULT_THEME_ID;
  });

  const currentConfig = useMemo(
    () => THEME_CONFIGS.find((t) => t.id === themeId) ?? THEME_CONFIGS[0],
    [themeId]
  );

  const muiTheme = useMemo(() => createAppTheme(currentConfig), [currentConfig]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentConfig.id);
    document.documentElement.setAttribute("data-bg-pattern", currentConfig.backgroundPattern);

    const root = document.documentElement.style;
    const { palette, borderStyle } = currentConfig;
    root.setProperty("--tf-primary", palette.primary);
    root.setProperty("--tf-secondary", palette.secondary);
    root.setProperty("--tf-text-secondary", palette.textSecondary);
    root.setProperty("--tf-panel", palette.panel);
    root.setProperty("--tf-panel-dark", darken(palette.panel, 0.25));
    root.setProperty("--tf-bevel-light", lighten(palette.panel, 0.35));
    root.setProperty("--tf-bevel-dark", darken(palette.panel, 0.55));
    root.setProperty("--tf-primary-light", lighten(palette.primary, 0.3));
    root.setProperty("--tf-radius", borderStyle === "rounded" ? "8px" : "0px");
    root.setProperty("--tf-border-width", borderStyle === "bevel" ? "2px" : "1px");

    const headingFont =
      currentConfig.fontStyle === "pixel"
        ? '"Press Start 2P", monospace'
        : currentConfig.fontStyle === "mono"
          ? '"Courier New", monospace'
          : currentConfig.fontStyle === "serif"
            ? '"Georgia", serif'
            : '"Inter", "Segoe UI", sans-serif';
    root.setProperty("--tf-heading-font", headingFont);
  }, [currentConfig]);

  function setThemeId(id: string) {
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <AppThemeContext.Provider value={{ themeId, setThemeId, themes: THEME_CONFIGS, currentConfig }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme должен использоваться внутри AppThemeProvider");
  }
  return ctx;
}
