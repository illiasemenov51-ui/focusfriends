import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habitApi } from "../api/habitApi";
import { useGamification } from "../context/GamificationContext";
import type { Habit } from "../types/habit";

const categoryLabel: Record<Habit["category"], string> = {
  STUDY: "Учёба",
  SPORT: "Спорт",
  READING: "Чтение",
  CODING: "Код",
  OTHER: "Другое",
};

// Базовый опыт за отметку привычки + бонус за длину серии (макс. +30).
const HABIT_BASE_XP = 15;
const STREAK_XP_PER_DAY = 2;
const STREAK_XP_CAP = 30;

export function HabitCard({ habit }: { habit: Habit }) {
  const queryClient = useQueryClient();

  const { data: streak } = useQuery({
    queryKey: ["habit-streak", habit.id],
    queryFn: () => habitApi.getStreak(habit.id),
  });

  const { addXp } = useGamification();

  const logMutation = useMutation({
    mutationFn: () => habitApi.logToday(habit.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-streak", habit.id] });
      const streakBonus = Math.min((streak?.currentStreak ?? 0) * STREAK_XP_PER_DAY, STREAK_XP_CAP);
      addXp(HABIT_BASE_XP + streakBonus, `Привычка: ${habit.title}`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => habitApi.remove(habit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habits"] }),
  });

  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 500 }}>{habit.title}</Typography>
          <Chip label={categoryLabel[habit.category]} size="small" sx={{ mt: 0.5 }} />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "warning.main" }}>
          <LocalFireDepartmentIcon fontSize="small" />
          <Typography sx={{ fontWeight: 600 }}>{streak?.currentStreak ?? 0}</Typography>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          onClick={() => logMutation.mutate()}
          disabled={logMutation.isPending}
        >
          Отметить сегодня
        </Button>

        <IconButton size="small" onClick={() => removeMutation.mutate()}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
