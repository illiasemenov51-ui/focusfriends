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
            borderRadius: 4,
            overflow: "hidden",
            textAlign: "center",
            px: 4,
            py: 5,
            background: "linear-gradient(160deg, #5B5FEF 0%, #7C6FF0 100%)",
            color: "#fff",
            minWidth: 280,
          },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {Array.from({ length: 12 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className="confetti-piece" style={{ "--i": i } as never} />
        ))}
        <Typography sx={{ fontSize: 48, lineHeight: 1 }}>🎉</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 1.5 }}>
          Новый уровень!
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, my: 1 }}>
          Ур. {levelUpEvent?.level}
        </Typography>
        <Typography sx={{ opacity: 0.9, mb: 3, fontSize: 14 }}>
          Продолжай выполнять задачи и привычки — опыт копится за каждое действие
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={dismissLevelUp}
          sx={{ fontWeight: 700 }}
        >
          Отлично!
        </Button>
      </Box>
    </Dialog>
  );
}
