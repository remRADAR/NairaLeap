import { createServerFn } from "@tanstack/react-start";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const listMyServiceRequests = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("You must be signed in to view your requests.");
  }

  const { data, error } = await supabase
    .from("service_requests")
    .select("id, service_id, schema_version, status, source, created_at, updated_at")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("We could not load your service requests.");
  }

  return { requests: data };
});
