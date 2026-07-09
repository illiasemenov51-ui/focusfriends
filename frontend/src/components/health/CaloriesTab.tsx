import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "../../api/healthApi";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CaloriesTab() {
  const queryClient = useQueryClient();
  const [goalInput, setGoalInput] = useState<string>("");

  const settingsQuery = useQuery({
    queryKey: ["health", "settings"],
    queryFn: healthApi.getSettings,
  });

  const summaryQuery = useQuery({
    queryKey: ["health", "summary"],
    queryFn: healthApi.getSummary,
  });

  const todayQuery = useQuery({
    queryKey: ["health", "checkins", "today"],
    queryFn: () => healthApi.listCheckins(todayIso(), todayIso()),
  });

  const todayCalories = todayQuery.data?.[0]?.caloriesIntake ?? null;

  const saveGoalMutation = useMutation({
    mutationFn: (calorieGoal: number | null) =>
      healthApi.updateSettings({
        shareWithFriends: settingsQuery.data?.shareWithFriends ?? true,
        calorieGoal,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health", "settings"] });
      setGoalInput("");
    },
  });

  const currentGoal = settingsQuery.data?.calorieGoal ?? null;
  const avgCalories = summaryQuery.data?.avgCalories ?? null;
  const progress = currentGoal && avgCalories ? Math.min((avgCalories / currentGoal) * 100, 150) : null;

  return (
    <Box>
      {todayCalories != null && (
        <Alert icon={<CheckCircleOutlineIcon />} severity="success" sx={{ mb: 2 }}>
          Калории на сегодня уже посчитаны: {todayCalories} ккал
        </Alert>
      )}

      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent>
          <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1.5 }}>
            дневная цель по калориям
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              size="small"
              type="number"
              label="Цель, ккал"
              placeholder={currentGoal ? String(currentGoal) : "не задана"}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              slotProps={{ htmlInput: { step: 50, min: 0, max: 20000 } }}
              sx={{ minWidth: 160 }}
            />
            <Button
              variant="outlined"
              disabled={!goalInput || saveGoalMutation.isPending}
              onClick={() => saveGoalMutation.mutate(Number(goalInput))}
            >
              Сохранить
            </Button>
            {currentGoal != null && (
              <Button
                size="small"
                disabled={saveGoalMutation.isPending}
                onClick={() => saveGoalMutation.mutate(null)}
              >
                Снять цель
              </Button>
            )}
          </Stack>

          {saveGoalMutation.isSuccess && <Alert severity="success" sx={{ mt: 1.5 }}>Сохранено</Alert>}
        </CardContent>
      </Card>

      {summaryQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Card variant="outlined" className="app-card">
          <CardContent>
            <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1 }}>
              за последние 7 дней
            </Typography>

            {avgCalories == null ? (
              <Typography sx={{ fontSize: 18 }}>
                Пока нет отметок калорий — заполняй поле «калорий за день» на вкладке «Чек-ин»
              </Typography>
            ) : (
              <>
                <Typography sx={{ fontSize: 22, mb: 1 }}>{avgCalories} ккал/день в среднем</Typography>

                {currentGoal != null && progress != null && (
                  <Box sx={{ mb: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                      <Typography className="pixel-muted" sx={{ fontSize: 14 }}>
                        относительно цели ({currentGoal} ккал)
                      </Typography>
                      <Typography sx={{ fontSize: 14 }}>{Math.round(progress)}%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        height: 10,
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: progress > 115 || progress < 85 ? "#E08669" : "#7FBF8F",
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
