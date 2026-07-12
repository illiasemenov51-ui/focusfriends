import { useState, type SyntheticEvent } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useQuery } from "@tanstack/react-query";
import { leaderboardApi } from "../api/leaderboardApi";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import type { LeaderboardEntryWithProfile, LeaderboardPeriod } from "../types/leaderboard";

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "WEEK", label: "Неделя" },
  { value: "MONTH", label: "Месяц" },
  { value: "ALL", label: "Всё время" },
];

const MEDAL_COLORS = ["#FFD166", "#C0C0C0", "#CD7F32"];

export function LeaderboardSection() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("WEEK");

  function handleChange(_: SyntheticEvent, value: LeaderboardPeriod) {
    setPeriod(value);
  }

  const { data: entries, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: async (): Promise<LeaderboardEntryWithProfile[]> => {
      const raw = await leaderboardApi.get(period);
      const withProfiles = await Promise.all(
        raw.map(async (entry) => {
          try {
            const profile = await userApi.getPublicProfile(entry.userId);
            return { ...entry, name: profile.name, avatarUrl: profile.avatarUrl };
          } catch {
            return { ...entry, name: "Игрок", avatarUrl: null };
          }
        })
      );
      return withProfiles;
    },
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          РЕЙТИНГ
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          очки друзей
        </Typography>
      </Box>

      <Tabs
        value={period}
        onChange={handleChange}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {PERIODS.map((p) => (
          <Tab key={p.value} value={p.value} label={p.label} />
        ))}
      </Tabs>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : entries && entries.length > 0 ? (
        <Stack spacing={1.5}>
          {entries.map((entry, index) => {
            const isMe = entry.userId === user?.id;
            const medalColor = MEDAL_COLORS[index];

            return (
              <Card
                key={entry.userId}
                variant="outlined"
                className="fade-in-item app-card"
                style={{ animationDelay: `${index * 0.05}s` }}
                sx={{
                  borderColor: isMe ? "primary.main" : undefined,
                  borderWidth: isMe ? 3 : undefined,
                  bgcolor: isMe ? "rgba(217, 164, 65, 0.1)" : undefined,
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: { xs: "wrap", sm: "nowrap" },
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: medalColor ? 18 : 15,
                      color: medalColor ?? "text.secondary",
                      flexShrink: 0,
                      fontFamily: '"Press Start 2P", monospace',
                    }}
                  >
                    {medalColor ? <EmojiEventsIcon sx={{ color: medalColor }} /> : index + 1}
                  </Box>

                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "secondary.main",
                    }}
                  >
                    {entry.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontSize: 20, color: isMe ? "primary.main" : "text.primary" }}>
                      {entry.name} {isMe && "(ты)"}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "primary.main" }}>
                    {entry.points} XP
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4, fontSize: 20 }}>
          Пока никто не заработал очков за этот период — начни выполнять задачи!
        </Typography>
      )}
    </Box>
  );
}
