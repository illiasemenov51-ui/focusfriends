import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { authApi } from "../api/authApi";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset({ email });
      setStatus("success");
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? "Не удалось отправить ссылку для сброса пароля"
        : "Не удалось отправить ссылку для сброса пароля";
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
          Восстановление пароля
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Введи email, и мы отправим ссылку для сброса пароля
        </Typography>

        {status === "success" ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Если такой email существует, мы уже отправили письмо со ссылкой для сброса пароля.
            </Alert>
            <Button variant="contained" fullWidth onClick={() => navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`)}>
              Вернуться к входу
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
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
                  {isSubmitting ? "Отправляем..." : "Отправить ссылку"}
                </Button>
              </Stack>
            </form>
          </>
        )}

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          <Link component={RouterLink} to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
            Вернуться к входу
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
