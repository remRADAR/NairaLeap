export type ServiceRequestStatus = "draft" | "submitted" | "in_review" | "resolved" | "rejected";

export type ServiceRequestSource = "portal" | "admin" | "integration";

export interface ServiceRequest {
  id: string;
  userId: string;
  serviceId: string;
  schemaVersion: string;
  status: ServiceRequestStatus;
  submittedPayload: Record<string, unknown>;
  idempotencyKey: string;
  source: ServiceRequestSource;
  createdAt: string;
  updatedAt: string;
}
