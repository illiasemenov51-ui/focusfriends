import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import GroupsIcon from "@mui/icons-material/Groups";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "../api/groupApi";
import { leaderboardApi } from "../api/leaderboardApi";
import { userApi } from "../api/userApi";
import { EmptyState } from "./EmptyState";

export function GroupsSection() {
  const queryClient = useQueryClient();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");

  const groupsQuery = useQuery({
    queryKey: ["groups", "mine"],
    queryFn: groupApi.listMine,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => groupApi.create(name),
    onSuccess: () => {
      setNewGroupName("");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: string) => groupApi.join(groupId),
    onSuccess: () => {
      setJoinGroupId("");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const membersQuery = useQuery({
    queryKey: ["groups", "members", expandedGroupId],
    enabled: !!expandedGroupId,
    queryFn: async () => {
      const [members, allTimePoints] = await Promise.all([
        groupApi.listMembers(expandedGroupId!),
        leaderboardApi.get("ALL"),
      ]);
      const pointsByUserId = new Map(allTimePoints.map((e) => [e.userId, e.points]));

      const withProfiles = await Promise.all(
        members.map(async (m) => {
          try {
            const profile = await userApi.getPublicProfile(m.userId);
            return { userId: m.userId, name: profile.name, points: pointsByUserId.get(m.userId) ?? 0 };
          } catch {
            return { userId: m.userId, name: "Игрок", points: pointsByUserId.get(m.userId) ?? 0 };
          }
        })
      );

      return withProfiles.sort((a, b) => b.points - a.points);
    },
  });

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
        <Typography className="pixel-heading" sx={{ fontSize: 14 }}>
          ОТРЯДЫ
        </Typography>
        <Typography className="pixel-muted" sx={{ fontSize: 18 }}>
          командный рейтинг
        </Typography>
      </Box>

      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            label="Название отряда"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 180 }}
          />
          <Button
            variant="outlined"
            disabled={!newGroupName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(newGroupName.trim())}
          >
            Создать
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" className="app-card" sx={{ mb: 3 }}>
        <CardContent sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            label="ID отряда"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 220 }}
          />
          <Button
            variant="outlined"
            disabled={!joinGroupId.trim() || joinMutation.isPending}
            onClick={() => joinMutation.mutate(joinGroupId.trim())}
          >
            Вступить
          </Button>
        </CardContent>
        {joinMutation.isError && (
          <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
            Не получилось вступить — проверь id отряда или, может, ты уже в нём
          </Alert>
        )}
      </Card>

      {groupsQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : groups.length > 0 ? (
        <Stack spacing={1.5}>
          {groups.map((group, index) => {
            const isExpanded = expandedGroupId === group.id;

            return (
              <Card
                key={group.id}
                variant="outlined"
                className="fade-in-item app-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent sx={{ pb: isExpanded ? 1 : 2, "&:last-child": { pb: isExpanded ? 1 : 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", color: "#1A140C" }}>
                      <GroupsIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                      <Typography sx={{ fontSize: 20 }}>{group.name}</Typography>
                      <Typography
                        className="pixel-muted"
                        sx={{ fontSize: 13, overflowX: "auto", whiteSpace: "nowrap" }}
                      >
                        id: {group.id}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      Состав
                    </Button>
                  </Box>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "2px dashed #8A6B3E" }}>
                      {membersQuery.isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                          <CircularProgress size={20} />
                        </Box>
                      ) : (
                        <Stack spacing={1}>
                          {(membersQuery.data ?? []).map((member, i) => (
                            <Box key={member.userId} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Typography
                                sx={{ width: 22, fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "primary.main" }}
                              >
                                {i + 1}
                              </Typography>
                              <Typography sx={{ flexGrow: 1, fontSize: 18 }}>{member.name}</Typography>
                              <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "primary.main" }}>
                                {member.points} XP
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <EmptyState message="Пока нет отрядов — создай свой или вступи по id" />
      )}
    </Box>
  );
}
