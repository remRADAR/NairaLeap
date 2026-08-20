/// <reference types="vite/client" />

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  browserClient = createBrowserClient<Database>(url, publishableKey);
  return browserClient;
}
