import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Layout } from "../components/Layout";
import { userApi } from "../api/userApi";
import { friendApi } from "../api/friendApi";
import { useAuth } from "../context/AuthContext";

// Страница, на которую попадает пользователь по ссылке-приглашению
// вида /invite/{userId}. Показывает, кто пригласил, и отправляет заявку в друзья.
export function InvitePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["invite", "profile", userId],
    enabled: !!userId,
    queryFn: () => userApi.getPublicProfile(userId!),
    retry: false,
  });

  const sendRequestMutation = useMutation({
    mutationFn: () => friendApi.sendRequest(userId!),
    onError: (err) => {
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? "Не получилось отправить заявку"
        : "Не получилось отправить заявку";
      setErrorMessage(message);
    },
  });

  const isSelfInvite = !!user && !!userId && user.id === userId;

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "center", pt: { xs: 2, sm: 6 } }}>
        <Card variant="outlined" className="app-card" sx={{ maxWidth: 420, width: "100%" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography className="pixel-heading" sx={{ fontSize: 14, mb: 3 }}>
              ПРИГЛАШЕНИЕ В СОЮЗНИКИ
            </Typography>

            {profileQuery.isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {profileQuery.isError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: "left" }}>
                Не удалось найти пользователя по этой ссылке — возможно, она устарела.
              </Alert>
            )}

            {profileQuery.data && (
              <>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "secondary.main",
                    border: "2px solid #0B0E14",
                    boxShadow: "3px 3px 0 #000",
                    fontSize: 24,
                  }}
                >
                  {profileQuery.data.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: 22, mb: 3 }}>
                  {profileQuery.data.name} приглашает тебя в союзники
                </Typography>

                {isSelfInvite ? (
                  <Alert severity="info" sx={{ textAlign: "left" }}>
                    Это твоя собственная ссылка-приглашение — отправь её другу, чтобы добавиться в друзья.
                  </Alert>
                ) : sendRequestMutation.isSuccess ? (
                  <Alert severity="success" sx={{ textAlign: "left" }}>
                    Заявка отправлена! Как только {profileQuery.data.name} примет её — вы станете союзниками.
                  </Alert>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={sendRequestMutation.isPending}
                    onClick={() => sendRequestMutation.mutate()}
                  >
                    {sendRequestMutation.isPending ? "Отправляем..." : "Добавить в друзья"}
                  </Button>
                )}

                {errorMessage && (
                  <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
                    {errorMessage}
                  </Alert>
                )}
              </>
            )}

            <Button sx={{ mt: 3 }} onClick={() => navigate("/")}>
              На главную
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
