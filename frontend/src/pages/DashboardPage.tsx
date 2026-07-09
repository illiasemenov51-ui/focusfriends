import { useEffect, useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { Layout } from "../components/Layout";
import { TaskSection } from "../components/TaskSection";
import { HabitSection } from "../components/HabitSection";
import { LeaderboardSection } from "../components/LeaderboardSection";
import { FriendsSection } from "../components/FriendsSection";
import { CalendarSection } from "../components/CalendarSection";
import { GroupsSection } from "../components/GroupsSection";
import { HealthSection } from "../components/HealthSection";
import { PostureQuickAccess } from "../components/health/PostureQuickAccess";
import { useQuickActions } from "../context/QuickActionsContext";

const tabs = [
  { label: "КВЕСТЫ", hint: "задачи дают XP по сложности" },
  { label: "НАВЫКИ", hint: "привычки качают серию" },
  { label: "РЕЙТИНГ", hint: "соревнование друзей" },
  { label: "ДРУЗЬЯ", hint: "уровни и активность союзников" },
  { label: "ОТРЯДЫ", hint: "командный рейтинг" },
  { label: "КАЛЕНДАРЬ", hint: "развивайтесь вместе" },
  { label: "САМОЧУВСТВИЕ", hint: "сон, нагрузка, настроение" },
];

const HEALTH_TAB_INDEX = 6;

export function DashboardPage() {
  const [tab, setTab] = useState(0);
  const { postureSignal } = useQuickActions();

  function handleChange(_: SyntheticEvent, value: number) {
    setTab(value);
  }

  useEffect(() => {
    if (postureSignal > 0) {
      setTab(HEALTH_TAB_INDEX);
    }
  }, [postureSignal]);

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <PostureQuickAccess />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((item) => (
            <Tab key={item.label} label={item.label} />
          ))}
        </Tabs>
        <Box className="pixel-muted" sx={{ fontSize: 17, mt: 1 }}>
          {tabs[tab].hint}
        </Box>
      </Box>
      <Box>
        {tab === 0 && <TaskSection />}
        {tab === 1 && <HabitSection />}
        {tab === 2 && <LeaderboardSection />}
        {tab === 3 && <FriendsSection />}
        {tab === 4 && <GroupsSection />}
        {tab === 5 && <CalendarSection />}
        {tab === HEALTH_TAB_INDEX && <HealthSection />}
      </Box>
    </Layout>
  );
}
