import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

type Status = "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { refreshUser, isAuthenticated } = useAuth();

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setStatus("error");
      setErrorMessage("В ссылке отсутствует токен подтверждения.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(async () => {
        setStatus("success");
        await refreshUser();
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          isAxiosError(err) ? err.response?.data?.message ?? "Не удалось подтвердить email" : "Не удалось подтвердить email"
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        px: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Подтверждение email
        </Typography>

        {status === "verifying" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {status === "success" && (
          <>
            <Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
              Email подтверждён! Теперь тебе доступны все функции аккаунта.
            </Alert>
            <Button variant="contained" fullWidth onClick={() => navigate(isAuthenticated ? "/" : "/login")}>
              {isAuthenticated ? "На главную" : "Войти"}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {errorMessage}
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Если ссылка устарела — войди в аккаунт и запроси новое письмо на главной странице.
            </Typography>
            <Button variant="outlined" fullWidth onClick={() => navigate(isAuthenticated ? "/" : "/login")}>
              {isAuthenticated ? "На главную" : "Войти"}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
