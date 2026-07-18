import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import { useGamification } from "../context/GamificationContext";
import type { TaskPriority } from "../types/task";
import { EmptyState } from "./EmptyState";

const priorityColor: Record<TaskPriority, "default" | "warning" | "error"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "error",
};

const priorityIconColor: Record<TaskPriority, string> = {
  LOW: "#94A3B8",
  MEDIUM: "#F5A524",
  HIGH: "#E64545",
};

const priorityLabel: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

// Опыт за выполнение задачи зависит от её приоритета.
const XP_BY_PRIORITY: Record<TaskPriority, number> = {
  LOW: 10,
  MEDIUM: 20,
  HIGH: 35,
};

export function TaskSection() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApi.list(),
  });

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  const createMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
    },
  });

  const { addXp } = useGamification();

  const completeMutation = useMutation({
    mutationFn: taskApi.complete,
    onSuccess: (completedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addXp(XP_BY_PRIORITY[completedTask.priority], `Задача: ${completedTask.title}`);
    },
  });

  const removeMutation = useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), priority });
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          QUEST LOG
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          +10/+20/+35 XP
        </Typography>
      </Box>

      <Card component="form" onSubmit={handleCreate} sx={{ mb: 3 }} elevation={0} variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Новая задача"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Приоритет"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              size="small"
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="LOW">Низкий</MenuItem>
              <MenuItem value="MEDIUM">Средний</MenuItem>
              <MenuItem value="HIGH">Высокий</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              + QUEST
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : tasks && tasks.length > 0 ? (
        <Stack spacing={1.5}>
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              variant="outlined"
              className="fade-in-item app-card"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  "&:last-child": { pb: 2 },
                }}
              >
                <FlagCircleIcon sx={{ color: priorityIconColor[task.priority] }} fontSize="small" />
                <Checkbox
                  checked={task.status === "DONE"}
                  disabled={task.status === "DONE"}
                  onChange={() => completeMutation.mutate(task.id)}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{
                      textDecoration: task.status === "DONE" ? "line-through" : "none",
                      color: task.status === "DONE" ? "text.disabled" : "text.primary",
                      fontSize: 20,
                    }}
                  >
                    {task.title}
                  </Typography>
                </Box>
                <Chip
                  label={priorityLabel[task.priority]}
                  color={priorityColor[task.priority]}
                  size="small"
                  variant="outlined"
                />
                <IconButton size="small" onClick={() => removeMutation.mutate(task.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <EmptyState message="Пока нет задач" hint="добавь первую выше" />
      )}
    </Box>
  );
}
