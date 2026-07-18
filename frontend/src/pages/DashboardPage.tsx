import { useState, type SyntheticEvent } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { Layout } from "../components/Layout";
import { TaskSection } from "../components/TaskSection";
import { HabitSection } from "../components/HabitSection";
import { LeaderboardSection } from "../components/LeaderboardSection";
import { FriendsSection } from "../components/FriendsSection";
import { CalendarSection } from "../components/CalendarSection";
import { GroupsSection } from "../components/GroupsSection";
import { HealthSection } from "../components/HealthSection";

const tabs = [
  { label: "КВЕСТЫ", hint: "задачи дают XP по сложности" },
  { label: "НАВЫКИ", hint: "привычки качают серию" },
  { label: "РЕЙТИНГ", hint: "соревнование друзей" },
  { label: "ДРУЗЬЯ", hint: "уровни и активность союзников" },
  { label: "ОТРЯДЫ", hint: "командный рейтинг" },
  { label: "КАЛЕНДАРЬ", hint: "развивайтесь вместе" },
  { label: "САМОЧУВСТВИЕ", hint: "сон, нагрузка, настроение" },
];

export function DashboardPage() {
  const [tab, setTab] = useState(0);

  function handleChange(_: SyntheticEvent, value: number) {
    setTab(value);
  }

  return (
    <Layout>
      <Box className="pixel-panel" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box className="pixel-heading" sx={{ fontSize: { xs: 12, sm: 14 } }}>
            МЕНЮ ИГРОКА
          </Box>
          <Box className="pixel-muted" sx={{ fontSize: 18 }}>
            {tabs[tab].hint}
          </Box>
        </Box>
        <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((item) => (
            <Tab key={item.label} label={item.label} />
          ))}
        </Tabs>
      </Box>
      <Box>
        {tab === 0 && <TaskSection />}
        {tab === 1 && <HabitSection />}
        {tab === 2 && <LeaderboardSection />}
        {tab === 3 && <FriendsSection />}
        {tab === 4 && <GroupsSection />}
        {tab === 5 && <CalendarSection />}
        {tab === 6 && <HealthSection />}
      </Box>
    </Layout>
  );
}
