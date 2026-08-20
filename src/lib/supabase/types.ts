export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceRequestStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "resolved"
  | "rejected";

export interface AgricultureRequestPayload {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  farmLocation: string;
  farmSize: string;
  serviceType: string;
  cropOrLivestock: string;
  quantity: string;
  timeline: string;
  budgetRange?: string;
  inputsNeeded?: string;
  buyerPreferences?: string;
  additionalNotes?: string;
}

export interface Database {
  public: {
    Tables: {
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          status: ServiceRequestStatus;
          submitted_payload: Json;
          idempotency_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          status?: ServiceRequestStatus;
          submitted_payload: Json;
          idempotency_key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_requests"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      service_request_status: ServiceRequestStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
