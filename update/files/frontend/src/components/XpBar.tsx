import { useEffect, useRef, useState } from "react";
import { Box, LinearProgress, Tooltip, Typography } from "@mui/material";
import { useGamification } from "../context/GamificationContext";

export function XpBar() {
  const { level, currentLevelXp, xpForNextLevel, progress } = useGamification();
  const [pop, setPop] = useState(false);
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      setPop(true);
      const timer = setTimeout(() => setPop(false), 600);
      prevLevel.current = level;
      return () => clearTimeout(timer);
    }
    prevLevel.current = level;
  }, [level]);

  return (
    <Tooltip title={`${currentLevelXp} / ${xpForNextLevel} XP до следующего уровня`}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 150 }}>
        <Box
          className={pop ? "level-badge-pop" : undefined}
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            background: "linear-gradient(135deg, #FFD166, #FF7A59)",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.4)",
            flexShrink: 0,
          }}
        >
          {level}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 80 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress * 100, 100)}
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,0.25)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                background: "linear-gradient(90deg, #FFD166, #FF7A59)",
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
            {currentLevelXp} / {xpForNextLevel} XP
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}
