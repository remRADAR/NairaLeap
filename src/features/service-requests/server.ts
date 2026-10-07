import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { ServiceRequestStatus } from "./types";

type ServiceRequestListItem = Pick<
  Database["public"]["Tables"]["service_requests"]["Row"],
  | "id"
  | "user_id"
  | "service_id"
  | "schema_version"
  | "status"
  | "source"
  | "submitted_payload"
  | "created_at"
  | "updated_at"
>;

type AdminServiceRequest = ServiceRequestListItem;

async function requireAdmin() {
  const supabase = getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const role = authData.user?.app_metadata?.role;

  if (authError || !authData.user || role !== "admin") {
    throw new Error("You must be an admin to review customer requests.");
  }

  return supabase;
}

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

  return { requests: (data ?? []) as ServiceRequestListItem[] };
});

export const listAdminServiceRequests = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id, user_id, service_id, schema_version, status, source, submitted_payload, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("We could not load the admin request queue.");
  }

  return { requests: (data ?? []) as AdminServiceRequest[] };
});

const updateAdminServiceRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["submitted", "in_review", "resolved", "rejected"]),
});

export const updateAdminServiceRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateAdminServiceRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = await requireAdmin();
    const { data: request, error } = await supabase
      .from("service_requests")
      .update({ status: data.status as ServiceRequestStatus })
      .eq("id", data.requestId)
      .select("id, status, updated_at")
      .single();

    if (error) {
      console.error(error);
      throw new Error("We could not update this request status.");
    }

    return { request };
  });
