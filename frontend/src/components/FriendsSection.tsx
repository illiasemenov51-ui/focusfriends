import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendApi } from "../api/friendApi";
import { leaderboardApi } from "../api/leaderboardApi";
import { userApi } from "../api/userApi";
import { taskApi } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import { computeLevelInfo } from "../utils/level";
import type { FriendTask, FriendWithStats } from "../types/friend";

const TASK_STATUS_LABEL: Record<FriendTask["status"], string> = {
  TODO: "в очереди",
  IN_PROGRESS: "в бою",
  DONE: "пройдено",
};

function otherUserId(requesterId: string, addresseeId: string, myId: string): string {
  return requesterId === myId ? addresseeId : requesterId;
}

export function FriendsSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedFriendId, setExpandedFriendId] = useState<string | null>(null);
  const [newFriendId, setNewFriendId] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopyMyId() {
    if (!user) return;
    await navigator.clipboard.writeText(user.id);
    setCopied(true);
  }

  const friendsQuery = useQuery({
    queryKey: ["friends", "accepted", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<FriendWithStats[]> => {
      const [friendships, allTimePoints] = await Promise.all([
        friendApi.listAccepted(),
        leaderboardApi.get("ALL"),
      ]);

      const pointsByUserId = new Map(allTimePoints.map((e) => [e.userId, e.points]));

      return Promise.all(
        friendships.map(async (f) => {
          const friendId = otherUserId(f.requesterId, f.addresseeId, user!.id);
          const points = pointsByUserId.get(friendId) ?? 0;
          const levelInfo = computeLevelInfo(points);

          try {
            const profile = await userApi.getPublicProfile(friendId);
            return {
              friendshipId: f.id,
              userId: friendId,
              name: profile.name,
              avatarUrl: profile.avatarUrl,
              totalPoints: points,
              ...levelInfo,
            };
          } catch {
            return {
              friendshipId: f.id,
              userId: friendId,
              name: "Игрок",
              avatarUrl: null,
              totalPoints: points,
              ...levelInfo,
            };
          }
        })
      );
    },
  });

  const pendingQuery = useQuery({
    queryKey: ["friends", "pending", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const pending = await friendApi.listPending();
      return Promise.all(
        pending.map(async (f) => {
          try {
            const profile = await userApi.getPublicProfile(f.requesterId);
            return { ...f, requesterName: profile.name };
          } catch {
            return { ...f, requesterName: "Игрок" };
          }
        })
      );
    },
  });

  const friendTasksQuery = useQuery({
    queryKey: ["friends", "recent-tasks", expandedFriendId],
    enabled: !!expandedFriendId,
    queryFn: () => taskApi.listFriendRecent(expandedFriendId!),
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => friendApi.accept(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => friendApi.sendRequest(userId),
    onSuccess: () => setNewFriendId(""),
  });

  const sortedFriends = useMemo(
    () => (friendsQuery.data ?? []).slice().sort((a, b) => b.totalPoints - a.totalPoints),
    [friendsQuery.data]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          СОЮЗНИКИ
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          уровни и активность друзей
        </Typography>
      </Box>

      {/* Свой ID — поделиться с другом */}
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent
          sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", "&:last-child": { pb: 2 } }}
        >
          <Typography className="pixel-muted" sx={{ fontSize: 16, flexShrink: 0 }}>
            твой ID:
          </Typography>
          <Box
            className="pixel-slot"
            sx={{
              flexGrow: 1,
              minWidth: 220,
              justifyContent: "flex-start",
              px: 1.25,
              py: 0.75,
              fontSize: 16,
              color: "#F0E4C8",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {user?.id}
          </Box>
          <Tooltip title="Скопировать ID">
            <IconButton size="small" onClick={handleCopyMyId} aria-label="Скопировать ID">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Добавить друга по id */}
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            label="ID пользователя"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 240 }}
          />
          <Button
            variant="outlined"
            disabled={!newFriendId.trim() || sendRequestMutation.isPending}
            onClick={() => sendRequestMutation.mutate(newFriendId.trim())}
          >
            Отправить заявку
          </Button>
        </CardContent>
        {sendRequestMutation.isSuccess && (
          <Alert severity="success" sx={{ mx: 2, mb: 2 }}>
            Заявка отправлена — попроси друга принять её на своей стороне
          </Alert>
        )}
        {sendRequestMutation.isError && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            Не получилось отправить заявку — проверь id или, может, вы уже друзья
          </Alert>
        )}
      </Card>

      {/* Входящие заявки */}
      {pendingQuery.data && pendingQuery.data.length > 0 && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography className="pixel-muted" sx={{ fontSize: 16 }}>
            входящие заявки
          </Typography>
          {pendingQuery.data.map((req) => (
            <Card key={req.id} variant="outlined" className="app-card">
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, "&:last-child": { pb: 2 } }}>
                <Typography sx={{ flexGrow: 1, fontSize: 20 }}>{req.requesterName}</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  disabled={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate(req.id)}
                >
                  Принять
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Список друзей */}
      {friendsQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : sortedFriends.length > 0 ? (
        <Stack spacing={1.5}>
          {sortedFriends.map((friend, index) => {
            const isExpanded = expandedFriendId === friend.userId;

            return (
              <Card
                key={friend.userId}
                variant="outlined"
                className="fade-in-item app-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent sx={{ pb: isExpanded ? 1 : 2, "&:last-child": { pb: isExpanded ? 1 : 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "secondary.main",
                      }}
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box
                      className="pixel-slot"
                      sx={{
                        width: 30,
                        height: 30,
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: 11,
                        color: "#F0C97A",
                        flexShrink: 0,
                      }}
                    >
                      {friend.level}
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                      <Typography sx={{ fontSize: 20 }}>{friend.name}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(friend.progress * 100, 100)}
                        sx={{
                          height: 8,
                          mt: 0.5,
                          "& .MuiLinearProgress-bar": { backgroundColor: "secondary.main" },
                        }}
                      />
                    </Box>

                    <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "primary.main" }}>
                      {friend.totalPoints} XP
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => setExpandedFriendId(isExpanded ? null : friend.userId)}
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      Активность
                    </Button>
                  </Box>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "2px dashed #8A6B3E" }}>
                      {friendTasksQuery.isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : friendTasksQuery.data && friendTasksQuery.data.length > 0 ? (
                        <Stack spacing={1}>
                          {friendTasksQuery.data.map((task) => (
                            <Box
                              key={task.id}
                              sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                            >
                              <Typography sx={{ flexGrow: 1, fontSize: 18 }}>{task.title}</Typography>
                              <Chip label={TASK_STATUS_LABEL[task.status]} size="small" />
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography className="pixel-muted" sx={{ fontSize: 16 }}>
                          пока нет активности
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4, fontSize: 20 }}>
          Пока нет друзей — отправь заявку по id выше, чтобы начать соревноваться
        </Typography>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="ID скопирован"
      />
    </Box>
  );
}
