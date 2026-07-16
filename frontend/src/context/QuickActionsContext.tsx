import { createContext, useContext, useState, type ReactNode } from "react";

interface QuickActionsContextValue {
  // Растёт с каждым нажатием — так подписчики видят каждое новое нажатие,
  // даже если до этого уже были на нужной вкладке.
  postureSignal: number;
  triggerPostureQuickStart: () => void;
}

const QuickActionsContext = createContext<QuickActionsContextValue | null>(null);

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [postureSignal, setPostureSignal] = useState(0);

  function triggerPostureQuickStart() {
    setPostureSignal((n) => n + 1);
  }

  return (
    <QuickActionsContext.Provider value={{ postureSignal, triggerPostureQuickStart }}>
      {children}
    </QuickActionsContext.Provider>
  );
}

export function useQuickActions(): QuickActionsContextValue {
  const ctx = useContext(QuickActionsContext);
  if (!ctx) {
    throw new Error("useQuickActions должен использоваться внутри QuickActionsProvider");
  }
  return ctx;
}
