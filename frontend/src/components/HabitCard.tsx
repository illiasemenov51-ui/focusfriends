import { Box, Card, CardContent, Chip, IconButton, Stack, Typography, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habitApi } from "../api/habitApi";
import type { Habit } from "../types/habit";

const categoryLabel: Record<Habit["category"], string> = {
  STUDY: "Учёба",
  SPORT: "Спорт",
  READING: "Чтение",
  CODING: "Код",
  OTHER: "Другое",
};

export function HabitCard({ habit }: { habit: Habit }) {
  const queryClient = useQueryClient();

  const { data: streak } = useQuery({
    queryKey: ["habit-streak", habit.id],
    queryFn: () => habitApi.getStreak(habit.id),
  });

  const logMutation = useMutation({
    mutationFn: () => habitApi.logToday(habit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habit-streak", habit.id] }),
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
