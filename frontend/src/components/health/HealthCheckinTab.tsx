import { useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import BoltIcon from "@mui/icons-material/Bolt";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "../../api/healthApi";
import { friendApi } from "../../api/friendApi";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import { LevelPicker, SummaryCard, otherUserId } from "./shared";

export function HealthCheckinTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sleepHours, setSleepHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [calories, setCalories] = useState<string>("");
  const [note, setNote] = useState("");
  const [friendId, setFriendId] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["health", "summary"],
    queryFn: healthApi.getSummary,
  });

  const friendsQuery = useQuery({
    queryKey: ["friends", "accepted-names", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const friendships = await friendApi.listAccepted();
      return Promise.all(
        friendships.map(async (f) => {
          const id = otherUserId(f.requesterId, f.addresseeId, user!.id);
          try {
            const profile = await userApi.getPublicProfile(id);
            return { id, name: profile.name };
          } catch {
            return { id, name: "Игрок" };
          }
        })
      );
    },
  });

  const friendSummaryQuery = useQuery({
    queryKey: ["health", "friend-summary", friendId],
    enabled: !!friendId,
    retry: false,
    queryFn: () => healthApi.getFriendSummary(friendId),
  });

  const checkinMutation = useMutation({
    mutationFn: () =>
      healthApi.submitCheckin({
        sleepHours,
        energyLevel: energy,
        stressLevel: stress,
        moodLevel: mood,
        caloriesIntake: calories ? Number(calories) : undefined,
        note: note || undefined,
      }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
  });

  const friendName = useMemo(
    () => friendsQuery.data?.find((f) => f.id === friendId)?.name,
    [friendsQuery.data, friendId]
  );

  return (
    <Box>
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent>
          <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1.5 }}>
            отметиться за сегодня
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ maxWidth: 220 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.5 }}>
                <BedtimeIcon fontSize="small" sx={{ color: "#D9C4A0" }} />
                <Typography className="pixel-muted" sx={{ fontSize: 15 }}>
                  часов сна
                </Typography>
              </Stack>
              <TextField
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: 0.5, min: 0, max: 24 } }}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                fullWidth
              />
            </Box>

            <LevelPicker label="энергия" icon={<BoltIcon fontSize="small" sx={{ color: "#D9C4A0" }} />} value={energy} onChange={setEnergy} />
            <LevelPicker label="стресс" icon={<WhatshotIcon fontSize="small" sx={{ color: "#D9C4A0" }} />} value={stress} onChange={setStress} />
            <LevelPicker
              label="настроение"
              icon={<SentimentSatisfiedAltIcon fontSize="small" sx={{ color: "#D9C4A0" }} />}
              value={mood}
              onChange={setMood}
            />

            <Box sx={{ maxWidth: 220 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.5 }}>
                <RestaurantIcon fontSize="small" sx={{ color: "#D9C4A0" }} />
                <Typography className="pixel-muted" sx={{ fontSize: 15 }}>
                  калорий за день (необязательно)
                </Typography>
              </Stack>
              <TextField
                size="small"
                type="number"
                slotProps={{ htmlInput: { step: 50, min: 0, max: 20000 } }}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="напр. 2100"
                fullWidth
              />
            </Box>

            <TextField
              size="small"
              label="Заметка (необязательно)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              maxRows={3}
            />

            <Button
              variant="outlined"
              disabled={checkinMutation.isPending}
              onClick={() => checkinMutation.mutate()}
              sx={{ alignSelf: "flex-start" }}
            >
              Сохранить отметку
            </Button>
            {checkinMutation.isSuccess && <Alert severity="success">Записано — можешь глянуть сводку ниже</Alert>}
          </Stack>
        </CardContent>
      </Card>

      {summaryQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : summaryQuery.data ? (
        <Box sx={{ mb: 2 }}>
          <SummaryCard title="твоя неделя" summary={summaryQuery.data} />
        </Box>
      ) : null}

      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <TextField
            select
            size="small"
            label="Сравнить с другом"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">— не выбрано —</MenuItem>
            {(friendsQuery.data ?? []).map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {friendId && friendSummaryQuery.isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {friendId && friendSummaryQuery.isError && (
        <Alert severity="info">
          {friendName ?? "Этот друг"} не делится сводкой (или ещё не отмечался) — данные недоступны
        </Alert>
      )}
      {friendId && friendSummaryQuery.data && (
        <SummaryCard title={`неделя: ${friendName ?? "друг"}`} summary={friendSummaryQuery.data} />
      )}
    </Box>
  );
}
