import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiTokenApi } from "../api/apiTokenApi";
import { API_BASE_URL } from "../api/client";

export function ApiTokensSection() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("iPhone Shortcuts");
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const tokensQuery = useQuery({
    queryKey: ["api-tokens"],
    queryFn: apiTokenApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (n: string) => apiTokenApi.create(n),
    onSuccess: (created) => {
      setFreshToken(created.token);
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiTokenApi.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["api-tokens"] }),
  });

  const activeTokens = (tokensQuery.data ?? []).filter((t) => !t.revoked);

  return (
    <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
      <CardContent>
        <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1 }}>
          интеграции · токены для автоматизаций (например, iOS Shortcuts)
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center", mb: 1.5 }}>
          <TextField size="small" label="Название" value={name} onChange={(e) => setName(e.target.value)} sx={{ minWidth: 180 }} />
          <Button
            variant="outlined"
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(name.trim())}
          >
            Создать токен
          </Button>
        </Stack>

        {freshToken && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 15, mb: 0.5 }}>
              Токен показывается только один раз — сохрани его сейчас:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box
                className="pixel-slot"
                sx={{
                  flexGrow: 1,
                  justifyContent: "flex-start",
                  px: 1,
                  py: 0.5,
                  fontSize: 14,
                  overflowX: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {freshToken}
              </Box>
              <Tooltip title="Скопировать">
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(freshToken)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Alert>
        )}

        {activeTokens.length > 0 && (
          <Stack spacing={1} sx={{ mb: 1.5 }}>
            {activeTokens.map((token) => (
              <Stack key={token.id} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ flexGrow: 1, fontSize: 17 }}>{token.name}</Typography>
                <Typography className="pixel-muted" sx={{ fontSize: 13 }}>
                  {token.lastUsedAt ? `использован ${new Date(token.lastUsedAt).toLocaleDateString()}` : "ещё не использован"}
                </Typography>
                <Tooltip title="Отозвать">
                  <IconButton size="small" onClick={() => revokeMutation.mutate(token.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        )}

        <Button
          size="small"
          onClick={() => setShowGuide((v) => !v)}
          endIcon={showGuide ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          Как настроить Shortcut
        </Button>

        {showGuide && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "2px dashed #8A6B3E" }}>
            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 16 }}>1. Приложение Быстрые команды (Shortcuts) → создать новую</Typography>
              <Typography sx={{ fontSize: 16 }}>
                2. Действие «Получить образцы состояния здоровья» → тип: Сон, диапазон: прошлая ночь
              </Typography>
              <Typography sx={{ fontSize: 16 }}>3. Посчитать часы сна (или взять готовое значение из образца)</Typography>
              <Typography sx={{ fontSize: 16 }}>
                4. По желанию — «Запросить ввод» (число 1–5) для энергии/стресса/настроения
              </Typography>
              <Typography sx={{ fontSize: 16 }}>5. Действие «Получить содержимое URL»:</Typography>
              <Box className="pixel-slot" sx={{ p: 1.5, fontSize: 14, textAlign: "left", justifyContent: "flex-start" }}>
                <Box>
                  URL: {API_BASE_URL}/api/health/checkins
                  <br />
                  Метод: POST
                  <br />
                  Заголовки: Authorization = Bearer &lt;твой токен&gt;
                  <br />
                  Тело (JSON): sleepHours, energyLevel, stressLevel, moodLevel
                </Box>
              </Box>
              <Typography sx={{ fontSize: 16 }}>
                6. Автоматизация → «Время суток» (например, каждое утро в 9:00) → запускать этот Shortcut
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
