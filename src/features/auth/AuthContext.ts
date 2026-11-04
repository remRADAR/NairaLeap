import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface AuthActionResult {
  error: string | null;
  sessionCreated?: boolean;
  suggestSignUp?: boolean;
  suggestSignIn?: boolean;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
