import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useGamification, type XpGainEvent } from "../context/GamificationContext";

export function XpToast() {
  const { lastGain } = useGamification();
  const [toasts, setToasts] = useState<XpGainEvent[]>([]);

  useEffect(() => {
    if (!lastGain) return;
    setToasts((prev) => [...prev, lastGain]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== lastGain.id));
    }, 1700);
    return () => clearTimeout(timer);
  }, [lastGain]);

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 76,
        right: 16,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <Box
          key={toast.id}
          className="xp-toast"
          sx={{
            bgcolor: "#39FF14",
            color: "#0B0E14",
            px: 1.75,
            py: 1,
            boxShadow: "4px 4px 0 #000",
            minWidth: 160,
          }}
        >
          <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11 }}>
            +{toast.amount} XP
          </Typography>
          <Typography sx={{ fontSize: 16, opacity: 0.9 }}>{toast.reason}</Typography>
        </Box>
      ))}
    </Box>
  );
}
