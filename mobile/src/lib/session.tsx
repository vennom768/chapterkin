import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "@/src/lib/api";
import { authClient } from "@/src/lib/auth";
import type { Me } from "@/src/lib/types";

type SessionContextValue = {
  ready: boolean;
  me: Me | null;
  refresh: () => Promise<Me | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await api<Me>("/api/mobile/me");
      setMe(next);
      return next;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        setMe(null);
        return null;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          if (!cancelled) setMe(null);
          return;
        }
        const next = await api<Me>("/api/mobile/me");
        if (!cancelled) setMe(next);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setMe(null);
  }, []);

  return (
    <SessionContext.Provider value={{ ready, me, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return value;
}
