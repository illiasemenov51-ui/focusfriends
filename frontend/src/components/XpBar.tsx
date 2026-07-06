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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 170 }}>
        <Box
          className={pop ? "level-badge-pop" : undefined}
          sx={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: '"Press Start 2P", monospace',
            fontWeight: 400,
            fontSize: 12,
            color: "#0B0E14",
            bgcolor: "#39FF14",
            border: "2px solid #0B0E14",
            boxShadow: "2px 2px 0 #000",
            flexShrink: 0,
          }}
        >
          {level}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 90 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress * 100, 100)}
            sx={{
              height: 10,
              bgcolor: "#0B0E14",
              border: "2px solid #0B0E14",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#FF206E",
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#8FB39A", lineHeight: 1.4, fontSize: 13 }}>
            {currentLevelXp} / {xpForNextLevel} XP
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
}
