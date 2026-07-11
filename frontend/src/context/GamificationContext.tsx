import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { leaderboardApi } from "../api/leaderboardApi";
import { useAuth } from "./AuthContext";
import { computeLevelInfo } from "../utils/level";

export interface XpGainEvent {
  id: number;
  amount: number;
  reason: string;
}

export interface LevelUpEvent {
  id: number;
  level: number;
}

interface GamificationState {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progress: number; // 0..1
}

interface GamificationContextValue extends GamificationState {
  addXp: (amount: number, reason: string) => void;
  lastGain: XpGainEvent | null;
  levelUpEvent: LevelUpEvent | null;
  dismissLevelUp: () => void;
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

function storageKey(userId: string): string {
  return `focusfriends_xp_${userId}`;
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [totalXp, setTotalXp] = useState(0);
  const [lastGain, setLastGain] = useState<XpGainEvent | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  const gainCounter = useRef(0);
  const loadedForUser = useRef<string | null>(null);

  // Загружаем накопленный опыт при смене пользователя (логин/логаут).
  useEffect(() => {
    if (!user) {
      setTotalXp(0);
      loadedForUser.current = null;
      return;
    }
    if (loadedForUser.current === user.id) return;

    const stored = localStorage.getItem(storageKey(user.id));
    const parsed = stored ? Number(stored) : 0;
    setTotalXp(Number.isFinite(parsed) ? parsed : 0);
    loadedForUser.current = user.id;
  }, [user]);

  const addXp = useCallback(
    (amount: number, reason: string) => {
      if (!user || amount <= 0) return;

      setTotalXp((prev) => {
        const next = prev + amount;
        localStorage.setItem(storageKey(user.id), String(next));

        const prevLevel = computeLevelInfo(prev).level;
        const nextLevel = computeLevelInfo(next).level;

        gainCounter.current += 1;
        setLastGain({ id: gainCounter.current, amount, reason });

        if (nextLevel > prevLevel) {
          setLevelUpEvent({ id: gainCounter.current, level: nextLevel });
        }

        // Синхронизируем с общим рейтингом друзей (не блокирует UI).
        leaderboardApi.awardPoints(user.id, amount, reason);

        return next;
      });
    },
    [user]
  );

  const dismissLevelUp = useCallback(() => setLevelUpEvent(null), []);

  const levelInfo = computeLevelInfo(totalXp);

  return (
    <GamificationContext.Provider
      value={{ ...levelInfo, addXp, lastGain, levelUpEvent, dismissLevelUp }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamification должен использоваться внутри GamificationProvider");
  }
  return ctx;
}
