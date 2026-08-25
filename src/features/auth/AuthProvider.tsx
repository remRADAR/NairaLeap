import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthActionResult {
  error: string | null;
  sessionCreated?: boolean;
  suggestSignUp?: boolean;
  suggestSignIn?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

function friendlyAuthError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "We could not complete that authentication request. Please try again.";
}

function shouldSuggestSignUp(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "user_not_found" || message.includes("invalid login credentials");
}

function shouldSuggestSignIn(error: { message?: string } | null): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (!error) setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return {
        error: error ? friendlyAuthError(error) : null,
        suggestSignUp: shouldSuggestSignUp(error),
      };
    } catch (error) {
      return { error: friendlyAuthError(error) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      return {
        error: error ? friendlyAuthError(error) : null,
        sessionCreated: Boolean(data.session),
        suggestSignIn: shouldSuggestSignIn(error),
      };
    } catch (error) {
      return { error: friendlyAuthError(error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      return { error: error ? friendlyAuthError(error) : null };
    } catch (error) {
      return { error: friendlyAuthError(error) };
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, configured: isConfigured, signIn, signUp, signOut }),
    [loading, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
