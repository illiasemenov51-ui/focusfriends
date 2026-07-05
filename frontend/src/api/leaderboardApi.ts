import { apiClient } from "./client";
import type { LeaderboardEntry, LeaderboardPeriod } from "../types/leaderboard";

export const leaderboardApi = {
  get: async (period: LeaderboardPeriod): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardEntry[]>("/api/leaderboard", {
      params: { period },
    });
    return response.data;
  },

  // Синхронизирует локально начисленный XP с общим рейтингом друзей.
  // Ошибки намеренно проглатываются — это фоновая синхронизация,
  // она не должна ломать локальный игровой процесс.
  awardPoints: async (userId: string, points: number, reason: string): Promise<void> => {
    try {
      await apiClient.post("/api/leaderboard/points", { userId, points, reason });
    } catch {
      // рейтинг не критичен для основного функционала — тихо игнорируем
    }
  },
};
