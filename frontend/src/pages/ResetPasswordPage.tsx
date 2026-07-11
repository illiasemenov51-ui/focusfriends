import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { authApi } from "../api/authApi";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("В ссылке отсутствует токен сброса пароля.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setStatus("success");
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? "Не удалось сбросить пароль"
        : "Не удалось сбросить пароль";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

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
      <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 440 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Новый пароль
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Придумай новый пароль для своего аккаунта
        </Typography>

        {!token && (
          <Alert severity="error" sx={{ mb: 2 }}>
            В ссылке отсутствует токен сброса пароля.
          </Alert>
        )}

        {status === "success" ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Пароль обновлён. Теперь можно войти с новыми данными.
            </Alert>
            <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
              Войти
            </Button>
          </>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Новый пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  disabled={!token}
                />
                <TextField
                  label="Повтори пароль"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  disabled={!token}
                />
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting || !token} fullWidth>
                  {isSubmitting ? "Сохраняем..." : "Сбросить пароль"}
                </Button>
              </Stack>
            </form>
          </>
        )}

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          <Link component={RouterLink} to="/login">
            Вернуться к входу
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
