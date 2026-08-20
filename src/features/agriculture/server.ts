import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { agriculturePayloadSchema } from "./schema";

const submitAgricultureRequestSchema = z.object({
  payload: agriculturePayloadSchema,
  idempotencyKey: z.string().uuid(),
});

export const submitAgricultureRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitAgricultureRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      throw new Error("You must be signed in to submit an Agriculture request.");
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
        service_id: "agriculture",
        schema_version: "agriculture.v1",
        status: "submitted",
        submitted_payload: data.payload,
        idempotency_key: data.idempotencyKey,
        source: "portal",
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      console.error(error);
      if (error.code === "23505") {
        const { data: duplicate } = await supabase
          .from("service_requests")
          .select("id, status, created_at")
          .eq("user_id", authData.user.id)
          .eq("idempotency_key", data.idempotencyKey)
          .single();
        if (duplicate) return { request: duplicate, alreadySubmitted: true };
      }
      throw new Error("We could not submit your Agriculture request. Please try again.");
    }

    return { request, alreadySubmitted: false };
  });
