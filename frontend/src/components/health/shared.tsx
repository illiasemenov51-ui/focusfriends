import { Box, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import type { WeeklySummary } from "../../types/health";

export const LEVEL_LABELS = ["", "1", "2", "3", "4", "5"];

export function otherUserId(requesterId: string, addresseeId: string, myId: string): string {
  return requesterId === myId ? addresseeId : requesterId;
}

export function loadColor(loadIndex: number): string {
  if (loadIndex >= 66) return "#E08669";
  if (loadIndex >= 33) return "#F0B65C";
  return "#7FBF8F";
}

export function LevelPicker({
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
              color: n === value ? "#FFD98F" : "#D9C4A0",
            }}
          >
            {LEVEL_LABELS[n]}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function SummaryCard({ title, summary }: { title: string; summary: WeeklySummary }) {
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
              {summary.avgCalories != null && (
                <Typography sx={{ fontSize: 17 }}>🍽️ {summary.avgCalories} ккал</Typography>
              )}
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
