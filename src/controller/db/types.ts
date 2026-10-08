export type JobStatus =
  | 'received'
  | 'queued'
  | 'running'
  | 'completed'
  | 'verified'
  | 'failed'
  | 'dead_letter';

export interface WebhookEventRecord {
  delivery_id: string;
  event_name: string;
  payload: Record<string, unknown>;
  received_at: string;
}

export interface RetryHistoryItem {
  attempt: number;
  failed_at: string;
  reason: string;
  worker_run_id?: string;
  error_details?: unknown;
}

export interface DurableJob {
  id: string;
  idempotency_key: string;
  delivery_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  worker_run_id?: string | null;
  deadline_at?: string | null;
  failure_reason?: string | null;
  retry_history: RetryHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface EvidenceReceipt {
  id: string;
  job_id: string;
  type: string;
  receipt_data: Record<string, unknown>;
  recorded_at: string;
}

export interface ValidationResult {
  id: string;
  job_id: string;
  validation_name: string;
  passed: boolean;
  details: Record<string, unknown>;
  validated_at: string;
}
