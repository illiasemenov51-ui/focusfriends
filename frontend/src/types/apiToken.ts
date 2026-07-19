export interface ApiToken {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export interface CreatedApiToken extends ApiToken {
  token: string; // видно только один раз, сразу после создания
}
