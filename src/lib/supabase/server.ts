import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie, setResponseHeader } from "@tanstack/react-start/server";

import type { Database } from "./types";

function getSupabaseConfig() {
  // Cloudflare Workers may expose deployment variables through process.env,
  // while a Vite build only guarantees import.meta.env. Both values are public
  // Supabase browser configuration; never use this fallback for a secret key.
  const url = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return { url, publishableKey };
}

export function getSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookies, headers) {
        cookies.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          setResponseHeader(name, value);
        });
      },
    },
  });
}
