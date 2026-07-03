import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { Layout } from "../components/Layout";
import { TaskSection } from "../components/TaskSection";
import { HabitSection } from "../components/HabitSection";

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
      </Tabs>
      <Box>{tab === 0 ? <TaskSection /> : <HabitSection />}</Box>
    </Layout>
  );
}
