export type FriendshipStatus = "PENDING" | "ACCEPTED";

export interface FriendshipResponse {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
}

// Дружба, обогащённая профилем и очками — то, что реально показываем в UI.
export interface FriendWithStats {
  friendshipId: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progress: number;
}

export interface FriendTask {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  completedCount: number;
  habitTitles: string[];
}
