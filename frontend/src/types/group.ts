export interface Group {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  joinedAt: string;
}

export interface GroupWithMembers extends Group {
  members: { userId: string; name: string; avatarUrl: string | null }[];
  totalPoints: number;
}
