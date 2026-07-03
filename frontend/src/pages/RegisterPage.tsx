import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  Link,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { isAxiosError } from "axios";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/");
    } catch (err) {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? "Не удалось зарегистрироваться"
        : "Не удалось зарегистрироваться";
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
      <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Создать аккаунт
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Присоединяйтесь к FocusFriends
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Минимум 8 символов"
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
              {isSubmitting ? "Создаём..." : "Зарегистрироваться"}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
          Уже есть аккаунт?{" "}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
