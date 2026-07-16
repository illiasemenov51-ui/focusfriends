import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useQuickActions } from "../../context/QuickActionsContext";

// 5 "позвонков" + голова. Смещения при сутулости — вбок и вниз по дуге,
// в прямом положении все смещения обнуляются (transform: translate(0,0)).
const SLOUCH_OFFSETS = [
  { dx: 10, dy: -2 }, // голова — сильнее всего вперёд/вниз
  { dx: 7, dy: 0 },
  { dx: 4, dy: 1 },
  { dx: 2, dy: 1 },
  { dx: 0, dy: 0 }, // таз — опорная точка, не двигается
];

const BASE_Y = [8, 22, 36, 50, 64];

export function PostureQuickAccess() {
  const { triggerPostureQuickStart } = useQuickActions();
  const [straight, setStraight] = useState(false);

  function handleClick() {
    setStraight(true);
    window.setTimeout(() => {
      triggerPostureQuickStart();
    }, 420);
    window.setTimeout(() => {
      setStraight(false);
    }, 1400);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Box
        component="button"
        onClick={handleClick}
        aria-label="Быстрый запуск контроля осанки"
        sx={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          border: "3px solid",
          borderColor: straight ? "#7FBF8F" : "#E08669",
          backgroundColor: "#241A12",
          boxShadow: "3px 3px 0 rgba(20, 12, 6, 0.55)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          transition: "border-color 0.4s ease, transform 0.15s ease",
          "&:hover": { transform: "translate(-1px, -1px)" },
          "&:active": { transform: "translate(1px, 1px)" },
        }}
      >
        <svg width="56" height="76" viewBox="0 0 40 76">
          {BASE_Y.map((y, i) => {
            const offset = straight ? { dx: 0, dy: 0 } : SLOUCH_OFFSETS[i];
            const isHead = i === 0;
            return (
              <circle
                key={i}
                cx={20}
                cy={y}
                r={isHead ? 8 : 5}
                fill={straight ? "#7FBF8F" : "#E08669"}
                style={{
                  transform: `translate(${offset.dx}px, ${offset.dy}px)`,
                  transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.4s ease",
                  transformOrigin: `20px ${y}px`,
                }}
              />
            );
          })}
        </svg>
      </Box>
      <Typography className="pixel-muted" sx={{ fontSize: 14, textAlign: "center" }}>
        {straight ? "вот так!" : "проверить осанку"}
      </Typography>
    </Box>
  );
}
