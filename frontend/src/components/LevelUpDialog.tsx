import { Dialog, Box, Typography, Button } from "@mui/material";
import { useGamification } from "../context/GamificationContext";

export function LevelUpDialog() {
  const { levelUpEvent, dismissLevelUp } = useGamification();

  return (
    <Dialog
      open={!!levelUpEvent}
      onClose={dismissLevelUp}
      slotProps={{
        paper: {
          sx: {
            overflow: "hidden",
            textAlign: "center",
            px: 4,
            py: 5,
            bgcolor: "#141A24",
            color: "#E9F3E6",
            minWidth: 300,
            border: "3px solid #39FF14",
            boxShadow: "6px 6px 0 #000",
          },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="confetti-piece" style={{ "--i": i } as never} />
        ))}
        <Typography sx={{ fontSize: 44, lineHeight: 1 }}>LVL</Typography>
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "0.9rem",
            mt: 2,
            color: "#39FF14",
          }}
        >
          НОВЫЙ УРОВЕНЬ!
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "2rem",
            my: 2,
            color: "#FF206E",
          }}
        >
          LV.{levelUpEvent?.level}
        </Typography>
        <Typography sx={{ opacity: 0.85, mb: 3, fontSize: 18 }}>
          Продолжай выполнять задачи и привычки — опыт копится за каждое действие
        </Typography>
        <Button variant="contained" color="secondary" onClick={dismissLevelUp}>
          Отлично!
        </Button>
      </Box>
    </Dialog>
  );
}
