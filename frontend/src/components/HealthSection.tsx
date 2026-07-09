import { useEffect, useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { HealthCheckinTab } from "./health/HealthCheckinTab";
import { CaloriesTab } from "./health/CaloriesTab";
import { PostureSection } from "./health/PostureSection";
import { HealthSettingsTab } from "./health/HealthSettingsTab";
import { useQuickActions } from "../context/QuickActionsContext";

const subTabs = ["ЧЕК-ИН", "КАЛОРИИ", "ОСАНКА", "НАСТРОЙКИ"];
const POSTURE_TAB_INDEX = 2;

export function HealthSection() {
  const [tab, setTab] = useState(0);
  const { postureSignal } = useQuickActions();

  function handleChange(_: SyntheticEvent, value: number) {
    setTab(value);
  }

  useEffect(() => {
    if (postureSignal > 0) {
      setTab(POSTURE_TAB_INDEX);
    }
  }, [postureSignal]);

  return (
    <Box>
      <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {subTabs.map((label) => (
          <Tab key={label} label={label} sx={{ fontSize: 9 }} />
        ))}
      </Tabs>

      {tab === 0 && <HealthCheckinTab />}
      {tab === 1 && <CaloriesTab />}
      {tab === 2 && <PostureSection />}
      {tab === 3 && <HealthSettingsTab />}
    </Box>
  );
}
