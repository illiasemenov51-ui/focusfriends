import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import BoltIcon from "@mui/icons-material/Bolt";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "../api/healthApi";
import { friendApi } from "../api/friendApi";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import type { WeeklySummary } from "../types/health";

const LEVEL_LABELS = ["", "1", "2", "3", "4", "5"];

function otherUserId(requesterId: string, addresseeId: string, myId: string): string {
  return requesterId === myId ? addresseeId : requesterId;
}

function loadColor(loadIndex: number): string {
  if (loadIndex >= 66) return "#C1443B";
  if (loadIndex >= 33) return "#D9A441";
  return "#7CB342";
}

function LevelPicker({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.5 }}>
        {icon}
        <Typography className="pixel-muted" sx={{ fontSize: 15 }}>
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.75}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Box
            key={n}
            onClick={() => onChange(n)}
            className={n === value ? "pixel-slot pixel-slot--selected" : "pixel-slot"}
            sx={{
              width: 34,
              height: 34,
              cursor: "pointer",
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 11,
              color: n === value ? "#F0C97A" : "#B8A278",
            }}
          >
            {LEVEL_LABELS[n]}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function SummaryCard({ title, summary }: { title: string; summary: WeeklySummary }) {
  return (
    <Card variant="outlined" className="app-card">
      <CardContent>
        <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1 }}>
          {title}
        </Typography>

        {!summary.hasData ? (
          <Typography sx={{ fontSize: 18 }}>{summary.notes[0]}</Typography>
        ) : (
          <>
            <Box sx={{ mb: 1.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                <Typography className="pixel-muted" sx={{ fontSize: 14 }}>
                  нагрузка недели
                </Typography>
                <Typography sx={{ fontSize: 14, color: loadColor(summary.loadIndex) }}>
                  {summary.loadIndex}/100
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={summary.loadIndex}
                sx={{ height: 10, "& .MuiLinearProgress-bar": { backgroundColor: loadColor(summary.loadIndex) } }}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", mb: 1.5 }}>
              <Typography sx={{ fontSize: 17 }}>🛌 {summary.avgSleepHours} ч сна</Typography>
              <Typography sx={{ fontSize: 17 }}>⚡ {summary.avgEnergy}/5 энергии</Typography>
              <Typography sx={{ fontSize: 17 }}>🔥 {summary.avgStress}/5 стресса</Typography>
              <Typography sx={{ fontSize: 17 }}>🙂 {summary.avgMood}/5 настроения</Typography>
            </Stack>

            <Stack spacing={0.5}>
              {summary.notes.map((note, i) => (
                <Typography key={i} className="pixel-muted" sx={{ fontSize: 15 }}>
                  · {note}
                </Typography>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function HealthSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sleepHours, setSleepHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [friendId, setFriendId] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["health", "summary"],
    queryFn: healthApi.getSummary,
  });

  const privacyQuery = useQuery({
    queryKey: ["health", "privacy"],
    queryFn: healthApi.getPrivacy,
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
    mutationFn: () => healthApi.submitCheckin({ sleepHours, energyLevel: energy, stressLevel: stress, moodLevel: mood, note: note || undefined }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
  });

  const privacyMutation = useMutation({
    mutationFn: (share: boolean) => healthApi.setPrivacy(share),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health", "privacy"] }),
  });

  const friendName = useMemo(
    () => friendsQuery.data?.find((f) => f.id === friendId)?.name,
    [friendsQuery.data, friendId]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          САМОЧУВСТВИЕ
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          сон, нагрузка, настроение
        </Typography>
      </Box>

      {/* Отметка за сегодня */}
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent>
          <Typography className="pixel-muted" sx={{ fontSize: 15, mb: 1.5 }}>
            отметиться за сегодня
          </Typography>

          <Stack spacing={2}>
            <Box sx={{ maxWidth: 220 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.5 }}>
                <BedtimeIcon fontSize="small" sx={{ color: "#B8A278" }} />
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

            <LevelPicker label="энергия" icon={<BoltIcon fontSize="small" sx={{ color: "#B8A278" }} />} value={energy} onChange={setEnergy} />
            <LevelPicker label="стресс" icon={<WhatshotIcon fontSize="small" sx={{ color: "#B8A278" }} />} value={stress} onChange={setStress} />
            <LevelPicker
              label="настроение"
              icon={<SentimentSatisfiedAltIcon fontSize="small" sx={{ color: "#B8A278" }} />}
              value={mood}
              onChange={setMood}
            />

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

      {/* Приватность */}
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={privacyQuery.data ?? true}
                disabled={privacyQuery.isLoading || privacyMutation.isPending}
                onChange={(e) => privacyMutation.mutate(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: 17 }}>Показывать мою сводку друзьям</Typography>}
          />
        </CardContent>
      </Card>

      {/* Своя сводка */}
      {summaryQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : summaryQuery.data ? (
        <Box sx={{ mb: 2 }}>
          <SummaryCard title="твоя неделя" summary={summaryQuery.data} />
        </Box>
      ) : null}

      {/* Сравнение с другом */}
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
