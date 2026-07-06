import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habitApi } from "../api/habitApi";
import type { HabitCategory } from "../types/habit";
import { HabitCard } from "./HabitCard";

export function HabitSection() {
  const queryClient = useQueryClient();
  const { data: habits, isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: () => habitApi.list(),
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HabitCategory>("OTHER");

  const createMutation = useMutation({
    mutationFn: habitApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setTitle("");
    },
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), category });
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          SKILL TREE
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          streak bonus
        </Typography>
      </Box>

      <Card component="form" onSubmit={handleCreate} sx={{ mb: 3 }} elevation={0} variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Новая привычка"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Категория"
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="STUDY">Учёба</MenuItem>
              <MenuItem value="SPORT">Спорт</MenuItem>
              <MenuItem value="READING">Чтение</MenuItem>
              <MenuItem value="CODING">Код</MenuItem>
              <MenuItem value="OTHER">Другое</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              + SKILL
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : habits && habits.length > 0 ? (
        <Stack spacing={1.5}>
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4, fontSize: 20 }}>
          Пока нет привычек — добавь первую выше
        </Typography>
      )}
    </Box>
  );
}
