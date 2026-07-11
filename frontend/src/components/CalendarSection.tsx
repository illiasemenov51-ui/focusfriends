import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { habitApi } from "../api/habitApi";
import { friendApi } from "../api/friendApi";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const WEEKDAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

function otherUserId(requesterId: string, addresseeId: string, myId: string): string {
  return requesterId === myId ? addresseeId : requesterId;
}

export function CalendarSection() {
  const { user } = useAuth();
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [friendId, setFriendId] = useState<string>("");

  const rangeStart = startOfMonth(monthAnchor);
  const rangeEnd = endOfMonth(monthAnchor);
  const from = format(rangeStart, "yyyy-MM-dd");
  const to = format(rangeEnd, "yyyy-MM-dd");

  const gridStart = startOfWeek(rangeStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(rangeEnd, { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

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

  const myCalendarQuery = useQuery({
    queryKey: ["calendar", "me", from, to],
    queryFn: () => habitApi.getCalendar(from, to),
  });

  const friendCalendarQuery = useQuery({
    queryKey: ["calendar", "friend", friendId, from, to],
    enabled: !!friendId,
    queryFn: () => habitApi.getFriendCalendar(friendId, from, to),
  });

  const myByDate = useMemo(() => {
    const map = new Map<string, { count: number; titles: string[] }>();
    for (const day of myCalendarQuery.data ?? []) {
      map.set(day.date, { count: day.completedCount, titles: day.habitTitles });
    }
    return map;
  }, [myCalendarQuery.data]);

  const friendByDate = useMemo(() => {
    const map = new Map<string, { count: number; titles: string[] }>();
    for (const day of friendCalendarQuery.data ?? []) {
      map.set(day.date, { count: day.completedCount, titles: day.habitTitles });
    }
    return map;
  }, [friendCalendarQuery.data]);

  const friendName = friendsQuery.data?.find((f) => f.id === friendId)?.name;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          КАЛЕНДАРЬ
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          развиваемся вместе
        </Typography>
      </Box>

      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button size="small" onClick={() => setMonthAnchor((d) => subMonths(d, 1))}>
            <ChevronLeftIcon />
          </Button>
          <Typography sx={{ fontSize: 20, minWidth: 160, textAlign: "center", textTransform: "capitalize" }}>
            {format(monthAnchor, "LLLL yyyy", { locale: ru })}
          </Typography>
          <Button size="small" onClick={() => setMonthAnchor((d) => addMonths(d, 1))}>
            <ChevronRightIcon />
          </Button>

          <TextField
            select
            size="small"
            label="Сравнить с другом"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            sx={{ minWidth: 200, ml: { sm: "auto" } }}
          >
            <MenuItem value="">— только я —</MenuItem>
            {(friendsQuery.data ?? []).map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {(myCalendarQuery.isLoading || (friendId && friendCalendarQuery.isLoading)) && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.75 }}>
        {WEEKDAY_LABELS.map((label) => (
          <Typography key={label} className="pixel-muted" sx={{ fontSize: 13, textAlign: "center" }}>
            {label}
          </Typography>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const mine = myByDate.get(key);
          const theirs = friendByDate.get(key);
          const inMonth = isSameMonth(day, monthAnchor);

          const tooltipLines = [
            mine?.titles.length ? `Ты: ${mine.titles.join(", ")}` : null,
            theirs?.titles.length ? `${friendName ?? "Друг"}: ${theirs.titles.join(", ")}` : null,
          ].filter(Boolean);

          return (
            <Tooltip key={key} title={tooltipLines.length ? tooltipLines.join(" · ") : ""} disableHoverListener={tooltipLines.length === 0}>
              <Card
                variant="outlined"
                className="app-card"
                sx={{
                  opacity: inMonth ? 1 : 0.35,
                  border: isToday(day) ? "2px solid #39FF14" : undefined,
                }}
              >
                <CardContent sx={{ p: "6px !important", minHeight: 56 }}>
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{format(day, "d")}</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                    {Array.from({ length: Math.min(mine?.count ?? 0, 5) }).map((_, i) => (
                      <Box key={`m-${i}`} sx={{ width: 8, height: 8, bgcolor: "primary.main", border: "1px solid #0B0E14" }} />
                    ))}
                    {Array.from({ length: Math.min(theirs?.count ?? 0, 5) }).map((_, i) => (
                      <Box key={`f-${i}`} sx={{ width: 8, height: 8, bgcolor: "secondary.main", border: "1px solid #0B0E14" }} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Tooltip>
          );
        })}
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 10, height: 10, bgcolor: "primary.main", border: "1px solid #0B0E14" }} />
          <Typography className="pixel-muted" sx={{ fontSize: 14 }}>
            твои привычки
          </Typography>
        </Stack>
        {friendId && (
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 10, height: 10, bgcolor: "secondary.main", border: "1px solid #0B0E14" }} />
            <Typography className="pixel-muted" sx={{ fontSize: 14 }}>
              {friendName ?? "друг"}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
