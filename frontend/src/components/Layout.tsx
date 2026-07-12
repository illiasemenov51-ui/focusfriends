import type { ReactNode } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Container, Box, Avatar, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { XpBar } from "./XpBar";
import { XpToast } from "./XpToast";
import { LevelUpDialog } from "./LevelUpDialog";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: { xs: 1, sm: 0.5 } }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: { xs: "0.68rem", sm: "0.8rem" }, color: "primary.main" }}
          >
            ▮ FOCUSFRIENDS
          </Typography>
          {user && <XpBar />}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Обновить данные">
                <IconButton
                  size="small"
                  onClick={() => queryClient.invalidateQueries()}
                  aria-label="Обновить данные"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "secondary.main",
                  color: "#fff",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 12,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontSize: 18, display: { xs: "none", sm: "block" } }}>
                {user.name}
              </Typography>
              <Button
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 } }}>
        {children}
      </Container>
      {user && <XpToast />}
      {user && <LevelUpDialog />}
    </Box>
  );
}
