import type { ReactNode } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { XpBar } from "./XpBar";
import { XpToast } from "./XpToast";
import { LevelUpDialog } from "./LevelUpDialog";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            FocusFriends
          </Typography>
          {user && <XpBar />}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2">{user.name}</Typography>
              <Button color="inherit" size="small" onClick={handleLogout}>
                Выйти
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
      {user && <XpToast />}
      {user && <LevelUpDialog />}
    </Box>
  );
}
