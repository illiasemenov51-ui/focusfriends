import { Box, Typography } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <Box
      className="app-card"
      sx={{
        textAlign: "center",
        py: 5,
        px: 3,
        border: "3px solid",
      }}
    >
      <Box
        className="pixel-slot"
        sx={{
          width: 56,
          height: 56,
          mx: "auto",
          mb: 2,
        }}
      >
        <Inventory2Icon sx={{ fontSize: 28, color: "#8A6B3E" }} />
      </Box>
      <Typography sx={{ fontSize: 20, color: "text.primary" }}>{message}</Typography>
      {hint && (
        <Typography className="pixel-muted" sx={{ fontSize: 15, mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}
