import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { REQUEST_BLUEPRINT_MAP } from "@/features/request-blueprint-engine";
import type { ServiceId } from "@/features/service-intelligence-catalog";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

const submitServiceRequestSchema = z.object({
  serviceId: z.string().min(1),
  schemaVersion: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  idempotencyKey: z.string().uuid(),
});

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  return typeof value === "string" ? value.trim().length > 0 : false;
}

export const submitServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitServiceRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const blueprint = REQUEST_BLUEPRINT_MAP[data.serviceId];
    if (!blueprint) {
      throw new Error("This service does not have a request blueprint yet.");
    }

    const missingFields = blueprint.requiredFields
      .filter((field) => !hasValue(data.payload[field.key]))
      .map((field) => field.label);
    if (missingFields.length > 0) {
      throw new Error(`Please complete: ${missingFields.join(", ")}.`);
    }

    const supabase = getSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("You must be signed in to submit this request.");
    }

    const { data: existingRequest, error: existingError } = await supabase
      .from("service_requests")
      .select("id, status, created_at")
      .eq("user_id", authData.user.id)
      .eq("idempotency_key", data.idempotencyKey)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      throw new Error("We could not check whether this request was already submitted.");
    }

    if (existingRequest) return { request: existingRequest, alreadySubmitted: true };

    const { data: request, error } = await supabase
      .from("service_requests")
      .insert({
        user_id: authData.user.id,
        service_id: data.serviceId,
        schema_version: data.schemaVersion,
        status: "submitted",
        submitted_payload: data.payload as Json,
        idempotency_key: data.idempotencyKey,
        source: "portal",
      })
      .select("id, service_id, schema_version, status, created_at")
      .single();

    if (error) {
      console.error(error);
      if (error.code === "23505") {
        const { data: duplicate } = await supabase
          .from("service_requests")
          .select("id, service_id, schema_version, status, created_at")
          .eq("user_id", authData.user.id)
          .eq("idempotency_key", data.idempotencyKey)
          .single();
        if (duplicate) return { request: duplicate, alreadySubmitted: true };
      }
      throw new Error("We could not submit your request. Please try again.");
    }

    return { request, alreadySubmitted: false };
  });

export type SubmitServiceRequestResult = Awaited<ReturnType<typeof submitServiceRequest>>;

export { submitServiceRequestSchema };
