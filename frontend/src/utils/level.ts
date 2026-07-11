export interface LevelInfo {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progress: number; // 0..1
}

// Сколько XP нужно, чтобы пройти конкретно этот уровень (растёт линейно).
export function xpRequiredForLevel(level: number): number {
  return 100 + (level - 1) * 25;
}

export function computeLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = totalXp;
  let needed = xpRequiredForLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpRequiredForLevel(level);
  }

  return {
    totalXp,
    level,
    currentLevelXp: remaining,
    xpForNextLevel: needed,
    progress: needed > 0 ? remaining / needed : 0,
  };
}
