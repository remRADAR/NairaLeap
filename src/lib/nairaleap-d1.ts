import type { Json } from "./supabase/types";

export type D1ServiceRequest = {
  id: string;
  user_id: string;
  service_id: string;
  schema_version: string;
  status: "draft" | "submitted" | "in_review" | "resolved" | "rejected";
  submitted_payload: Json;
  idempotency_key: string;
  source: "portal" | "admin" | "integration";
  created_at: string;
  updated_at: string;
};

type D1ServiceRequestRow = Omit<D1ServiceRequest, "submitted_payload"> & {
  submitted_payload: string;
};

export async function getNairaLeapD1(): Promise<D1Database | null> {
  const cloudflareEnv = (
    globalThis as typeof globalThis & { __env__?: { NAIRALEAP_DB?: D1Database } }
  ).__env__;
  return cloudflareEnv?.NAIRALEAP_DB ?? null;
}

function parseRow(row: D1ServiceRequestRow): D1ServiceRequest {
  return {
    ...row,
    submitted_payload: JSON.parse(row.submitted_payload) as Json,
  };
}

export async function findD1ServiceRequestByIdempotency(
  db: D1Database,
  userId: string,
  idempotencyKey: string,
): Promise<D1ServiceRequest | null> {
  const result = await db
    .prepare(
      `select id, user_id, service_id, schema_version, status, submitted_payload,
              idempotency_key, source, created_at, updated_at
         from service_requests
        where user_id = ?1 and idempotency_key = ?2
        limit 1`,
    )
    .bind(userId, idempotencyKey)
    .first<D1ServiceRequestRow>();

  return result ? parseRow(result) : null;
}

export async function insertD1ServiceRequest(
  db: D1Database,
  request: Omit<D1ServiceRequest, "submitted_payload"> & { submitted_payload: Json },
): Promise<D1ServiceRequest> {
  await db
    .prepare(
      `insert into service_requests
        (id, user_id, service_id, schema_version, status, submitted_payload,
         idempotency_key, source, created_at, updated_at)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    )
    .bind(
      request.id,
      request.user_id,
      request.service_id,
      request.schema_version,
      request.status,
      JSON.stringify(request.submitted_payload),
      request.idempotency_key,
      request.source,
      request.created_at,
      request.updated_at,
    )
    .run();

  return request;
}

export async function listD1ServiceRequestsForUser(
  db: D1Database,
  userId: string,
): Promise<D1ServiceRequest[]> {
  const result = await db
    .prepare(
      `select id, user_id, service_id, schema_version, status, submitted_payload,
              idempotency_key, source, created_at, updated_at
         from service_requests
        where user_id = ?1
        order by created_at desc`,
    )
    .bind(userId)
    .all<D1ServiceRequestRow>();

  return result.results.map(parseRow);
}

export async function listAllD1ServiceRequests(db: D1Database): Promise<D1ServiceRequest[]> {
  const result = await db
    .prepare(
      `select id, user_id, service_id, schema_version, status, submitted_payload,
              idempotency_key, source, created_at, updated_at
         from service_requests
        order by created_at desc`,
    )
    .all<D1ServiceRequestRow>();

  return result.results.map(parseRow);
}

export async function updateD1ServiceRequestStatus(
  db: D1Database,
  requestId: string,
  status: D1ServiceRequest["status"],
  updatedAt: string,
): Promise<Pick<D1ServiceRequest, "id" | "status" | "updated_at">> {
  await db
    .prepare("update service_requests set status = ?1, updated_at = ?2 where id = ?3")
    .bind(status, updatedAt, requestId)
    .run();

  const result = await db
    .prepare("select id, status, updated_at from service_requests where id = ?1 limit 1")
    .bind(requestId)
    .first<Pick<D1ServiceRequest, "id" | "status" | "updated_at">>();

  if (!result) throw new Error("We could not find this service request after updating it.");
  return result;
}
