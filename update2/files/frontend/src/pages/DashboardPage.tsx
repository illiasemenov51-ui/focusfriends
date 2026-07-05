import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { Layout } from "../components/Layout";
import { TaskSection } from "../components/TaskSection";
import { HabitSection } from "../components/HabitSection";
import { LeaderboardSection } from "../components/LeaderboardSection";

export function DashboardPage() {
  const [tab, setTab] = useState(0);

  function handleChange(_: SyntheticEvent, value: number) {
    setTab(value);
  }

  return (
    <Layout>
      <Tabs value={tab} onChange={handleChange} sx={{ mb: 3 }}>
        <Tab label="Задачи" />
        <Tab label="Привычки" />
        <Tab label="Рейтинг" />
      </Tabs>
      <Box>
        {tab === 0 ? <TaskSection /> : tab === 1 ? <HabitSection /> : <LeaderboardSection />}
      </Box>
    </Layout>
  );
}
