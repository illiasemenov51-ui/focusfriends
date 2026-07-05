export type LeaderboardPeriod = "WEEK" | "MONTH" | "ALL";

export interface LeaderboardEntry {
  userId: string;
  points: number;
}

export interface LeaderboardEntryWithProfile extends LeaderboardEntry {
  name: string;
  avatarUrl: string | null;
}
