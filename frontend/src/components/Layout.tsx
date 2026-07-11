import { useState, type ReactNode } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { XpBar } from "./XpBar";
import { XpToast } from "./XpToast";
import { LevelUpDialog } from "./LevelUpDialog";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleResend() {
    setResendState("sending");
    try {
      await authApi.resendVerification();
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: { xs: "0.68rem", sm: "0.8rem" }, color: "primary.main" }}
          >
            ▮ FOCUSFRIENDS
          </Typography>
          {user && <XpBar />}
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main",
                  color: "#fff",
                  border: "2px solid #0B0E14",
                  boxShadow: "2px 2px 0 #000",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 12,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontSize: 18 }}>
                {user.name}
              </Typography>
              <Button color="inherit" size="small" onClick={handleLogout}>
                Выйти
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 2.5, sm: 4 } }}>
        {user && !user.emailVerified && (
          <Alert
            severity="warning"
            sx={{ mb: 2.5 }}
            action={
              resendState === "sent" ? undefined : (
                <Button color="inherit" size="small" onClick={handleResend} disabled={resendState === "sending"}>
                  {resendState === "sending" ? "Отправляем..." : "Отправить письмо ещё раз"}
                </Button>
              )
            }
          >
            {resendState === "sent"
              ? "Письмо отправлено повторно — проверь почту (и папку «Спам»)."
              : "Подтверди свою почту — мы отправили письмо со ссылкой при регистрации."}
          </Alert>
        )}
        {children}
      </Container>
      {user && <XpToast />}
      {user && <LevelUpDialog />}
    </Box>
  );
}
