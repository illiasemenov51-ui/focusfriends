import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { GamificationProvider } from "./context/GamificationContext";
import { QuickActionsProvider } from "./context/QuickActionsContext";
import { AppThemeProvider } from "./theming/AppThemeProvider";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GamificationProvider>
            <QuickActionsProvider>
              <App />
            </QuickActionsProvider>
          </GamificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  </StrictMode>
);
