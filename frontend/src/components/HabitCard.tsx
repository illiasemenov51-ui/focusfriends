import { Avatar, Box, Card, CardContent, Chip, IconButton, Stack, Typography, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import SchoolIcon from "@mui/icons-material/School";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CodeIcon from "@mui/icons-material/Code";
import StarIcon from "@mui/icons-material/Star";
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

const categoryIcon: Record<Habit["category"], typeof SchoolIcon> = {
  STUDY: SchoolIcon,
  SPORT: FitnessCenterIcon,
  READING: MenuBookIcon,
  CODING: CodeIcon,
  OTHER: StarIcon,
};

const categoryColor: Record<Habit["category"], string> = {
  STUDY: "#4CC9F0",
  SPORT: "#7CB342",
  READING: "#D9A441",
  CODING: "#C1443B",
  OTHER: "#B8A278",
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

  const CategoryIcon = categoryIcon[habit.category];

  return (
    <Card variant="outlined" className="fade-in-item app-card">
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: { xs: "wrap", sm: "nowrap" },
          "&:last-child": { pb: 2 },
        }}
      >
        <Avatar
          sx={{
            bgcolor: categoryColor[habit.category],
            color: "#1A140C",
            width: 38,
            height: 38,
          }}
        >
          <CategoryIcon fontSize="small" />
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontSize: 20 }}>{habit.title}</Typography>
          <Chip label={categoryLabel[habit.category]} size="small" sx={{ mt: 0.5 }} />
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "warning.main" }}>
          <LocalFireDepartmentIcon fontSize="small" />
          <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12 }}>
            {streak?.currentStreak ?? 0}
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          onClick={() => logMutation.mutate()}
          disabled={logMutation.isPending}
        >
          CHECK
        </Button>

        <IconButton size="small" onClick={() => removeMutation.mutate()}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
