import { createServerFn } from "@tanstack/react-start";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) return { user: null };

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
      },
    };
  } catch {
    // Treat an unconfigured backend as signed out. The auth screen explains the
    // missing environment configuration without exposing server details.
    return { user: null };
  }
});
