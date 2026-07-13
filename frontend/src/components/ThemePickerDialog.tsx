import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useAppTheme } from "../theming/AppThemeProvider";

export function ThemePickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { themeId, setThemeId, themes } = useAppTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13 }}>ВЫБОР СТИЛЯ</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Закрыть">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 1.5,
            pb: 1,
          }}
        >
          {themes.map((t) => {
            const isSelected = t.id === themeId;
            return (
              <Box
                key={t.id}
                component="button"
                onClick={() => setThemeId(t.id)}
                sx={{
                  cursor: "pointer",
                  border: isSelected ? `2px solid ${t.palette.primary}` : "2px solid transparent",
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: "transparent",
                  textAlign: "left",
                }}
              >
                <Box
                  sx={{
                    height: 64,
                    mb: 0.75,
                    position: "relative",
                    backgroundColor: t.palette.background,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <Box sx={{ width: 20, height: 20, borderRadius: t.borderStyle === "rounded" ? "50%" : 0, backgroundColor: t.palette.primary }} />
                  <Box sx={{ width: 20, height: 20, borderRadius: t.borderStyle === "rounded" ? "50%" : 0, backgroundColor: t.palette.secondary }} />
                  <Box sx={{ width: 20, height: 20, borderRadius: t.borderStyle === "rounded" ? "50%" : 0, backgroundColor: t.palette.panel }} />
                  {isSelected && (
                    <Box sx={{ position: "absolute", top: 4, right: 4, color: t.palette.primary }}>
                      <CheckIcon fontSize="small" />
                    </Box>
                  )}
                </Box>
                <Typography sx={{ fontSize: 14, color: "text.primary" }}>{t.name}</Typography>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
