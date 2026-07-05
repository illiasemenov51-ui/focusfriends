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
            bgcolor: "#2e7d32",
            color: "#fff",
            px: 1.75,
            py: 1,
            borderRadius: 2,
            boxShadow: 4,
            minWidth: 160,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>+{toast.amount} XP</Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.9 }}>{toast.reason}</Typography>
        </Box>
      ))}
    </Box>
  );
}
