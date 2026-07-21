import { Box, Card, CardContent, FormControlLabel, Switch, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "../../api/healthApi";
import { ApiTokensSection } from "../ApiTokensSection";

export function HealthSettingsTab() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["health", "settings"],
    queryFn: healthApi.getSettings,
  });

  const shareMutation = useMutation({
    mutationFn: (shareWithFriends: boolean) =>
      healthApi.updateSettings({
        shareWithFriends,
        calorieGoal: settingsQuery.data?.calorieGoal ?? null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["health", "settings"] }),
  });

  return (
    <Box>
      <Card variant="outlined" className="app-card" sx={{ mb: 2 }}>
        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={settingsQuery.data?.shareWithFriends ?? true}
                disabled={settingsQuery.isLoading || shareMutation.isPending}
                onChange={(e) => shareMutation.mutate(e.target.checked)}
              />
            }
            label={<Typography sx={{ fontSize: 17 }}>Показывать мою сводку друзьям</Typography>}
          />
        </CardContent>
      </Card>

      <ApiTokensSection />
    </Box>
  );
}
