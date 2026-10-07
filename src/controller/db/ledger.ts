import {
  DurableJob,
  EvidenceReceipt,
  JobStatus,
  RetryHistoryItem,
  ValidationResult,
  WebhookEventRecord,
} from './types';

// Helper UUID generator
export function generateUUID(): string {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class DurableLedger {
  private inMemoryEvents = new Map<string, WebhookEventRecord>();
  private inMemoryJobs = new Map<string, DurableJob>();
  private inMemoryJobByIdempotency = new Map<string, string>(); // idempotency_key -> job_id
  private inMemoryEvidence = new Map<string, EvidenceReceipt[]>(); // job_id -> evidence[]
  private inMemoryValidation = new Map<string, ValidationResult[]>(); // job_id -> validation[]

  public useInMemory = true;
  private poolInstance: {
    query: <T = any>(sql: string, params?: any[]) => Promise<{ rows: T[] }>;
  } | null = null;

  constructor() {
    const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (dbUrl) {
      this.useInMemory = false;
    }
  }

  private async getPool(): Promise<{
    query: <T = any>(sql: string, params?: any[]) => Promise<{ rows: T[] }>;
  }> {
    if (!this.poolInstance) {
      const { Pool } = await import('@neondatabase/serverless');
      this.poolInstance = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
      }) as any;
    }
    return this.poolInstance!;
  }

  // Clear in-memory state for unit testing
  public resetInMemory(): void {
    this.inMemoryEvents.clear();
    this.inMemoryJobs.clear();
    this.inMemoryJobByIdempotency.clear();
    this.inMemoryEvidence.clear();
    this.inMemoryValidation.clear();
  }

  /**
   * Persists raw webhook event and delivery ID with duplicate detection.
   * Returns { event, duplicate: boolean }
   */
  public async persistWebhookEvent(
    deliveryId: string,
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<{ event: WebhookEventRecord; duplicate: boolean }> {
    if (this.useInMemory) {
      if (this.inMemoryEvents.has(deliveryId)) {
        return {
          event: this.inMemoryEvents.get(deliveryId)!,
          duplicate: true,
        };
      }
      const record: WebhookEventRecord = {
        delivery_id: deliveryId,
        event_name: eventName,
        payload,
        received_at: new Date().toISOString(),
      };
      this.inMemoryEvents.set(deliveryId, record);
      return { event: record, duplicate: false };
    }

    // Neon Postgres execution path (if DATABASE_URL configured)
    const pool = await this.getPool();
    const existing = await pool.query<WebhookEventRecord>(
      'SELECT * FROM webhook_events WHERE delivery_id = $1',
      [deliveryId]
    );
    if (existing.rows.length > 0) {
      return { event: existing.rows[0], duplicate: true };
    }

    const res = await pool.query<WebhookEventRecord>(
      `INSERT INTO webhook_events (delivery_id, event_name, payload, received_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [deliveryId, eventName, JSON.stringify(payload)]
    );
    return { event: res.rows[0], duplicate: false };
  }

  /**
   * Creates a durable job from a stored webhook event with permanent idempotency protection.
   */
  public async createJob(
    deliveryId: string,
    eventType: string,
    payload: Record<string, unknown>,
    customIdempotencyKey?: string,
    maxAttempts = 3
  ): Promise<{ job: DurableJob; isNew: boolean }> {
    const idempotencyKey =
      customIdempotencyKey || `github:delivery:${deliveryId}`;

    if (this.useInMemory) {
      if (this.inMemoryJobByIdempotency.has(idempotencyKey)) {
        const existingJobId = this.inMemoryJobByIdempotency.get(idempotencyKey)!;
        return {
          job: this.inMemoryJobs.get(existingJobId)!,
          isNew: false,
        };
      }

      const jobId = generateUUID();
      const now = new Date().toISOString();
      const job: DurableJob = {
        id: jobId,
        idempotency_key: idempotencyKey,
        delivery_id: deliveryId,
        event_type: eventType,
        payload,
        status: 'received',
        attempts: 0,
        max_attempts: maxAttempts,
        worker_run_id: null,
        deadline_at: null,
        failure_reason: null,
        retry_history: [],
        created_at: now,
        updated_at: now,
      };

      this.inMemoryJobs.set(jobId, job);
      this.inMemoryJobByIdempotency.set(idempotencyKey, jobId);
      return { job, isNew: true };
    }

    // Postgres execution
    const pool = await this.getPool();
    const existing = await pool.query<DurableJob>(
      'SELECT * FROM jobs WHERE idempotency_key = $1',
      [idempotencyKey]
    );
    if (existing.rows.length > 0) {
      return { job: existing.rows[0], isNew: false };
    }

    const jobId = generateUUID();
    const res = await pool.query<DurableJob>(
      `INSERT INTO jobs (id, idempotency_key, delivery_id, event_type, payload, status, attempts, max_attempts, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'received', 0, $6, NOW(), NOW())
       RETURNING *`,
      [jobId, idempotencyKey, deliveryId, eventType, JSON.stringify(payload), maxAttempts]
    );
    return { job: res.rows[0], isNew: true };
  }

  public async getJobById(jobId: string): Promise<DurableJob | null> {
    if (this.useInMemory) {
      return this.inMemoryJobs.get(jobId) || null;
    }
    const pool = await this.getPool();
    const res = await pool.query<DurableJob>('SELECT * FROM jobs WHERE id = $1', [jobId]);
    return res.rows[0] || null;
  }

  public async updateJobStatus(
    jobId: string,
    updates: {
      status: JobStatus;
      attempts?: number;
      worker_run_id?: string | null;
      deadline_at?: string | null;
      failure_reason?: string | null;
      addRetryHistory?: RetryHistoryItem;
    }
  ): Promise<DurableJob> {
    if (this.useInMemory) {
      const job = this.inMemoryJobs.get(jobId);
      if (!job) throw new Error(`Job not found: ${jobId}`);

      job.status = updates.status;
      if (updates.attempts !== undefined) job.attempts = updates.attempts;
      if (updates.worker_run_id !== undefined) job.worker_run_id = updates.worker_run_id;
      if (updates.deadline_at !== undefined) job.deadline_at = updates.deadline_at;
      if (updates.failure_reason !== undefined) job.failure_reason = updates.failure_reason;
      if (updates.addRetryHistory) {
        job.retry_history.push(updates.addRetryHistory);
      }
      job.updated_at = new Date().toISOString();
      this.inMemoryJobs.set(jobId, job);
      return job;
    }

    const pool = await this.getPool();
    const existingRes = await pool.query<DurableJob>('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (existingRes.rows.length === 0) throw new Error(`Job not found: ${jobId}`);
    const current = existingRes.rows[0];

    const newAttempts = updates.attempts !== undefined ? updates.attempts : current.attempts;
    const newWorkerRunId = updates.worker_run_id !== undefined ? updates.worker_run_id : current.worker_run_id;
    const newDeadlineAt = updates.deadline_at !== undefined ? updates.deadline_at : current.deadline_at;
    const newFailureReason = updates.failure_reason !== undefined ? updates.failure_reason : current.failure_reason;
    const currentRetry = Array.isArray(current.retry_history) ? current.retry_history : [];
    if (updates.addRetryHistory) {
      currentRetry.push(updates.addRetryHistory);
    }

    const res = await pool.query<DurableJob>(
      `UPDATE jobs
       SET status = $1, attempts = $2, worker_run_id = $3, deadline_at = $4, failure_reason = $5, retry_history = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [updates.status, newAttempts, newWorkerRunId, newDeadlineAt, newFailureReason, JSON.stringify(currentRetry), jobId]
    );
    return res.rows[0];
  }

  public async recordEvidenceReceipt(
    jobId: string,
    type: string,
    receiptData: Record<string, unknown>
  ): Promise<EvidenceReceipt> {
    const id = generateUUID();
    const recordedAt = new Date().toISOString();
    const receipt: EvidenceReceipt = {
      id,
      job_id: jobId,
      type,
      receipt_data: receiptData,
      recorded_at: recordedAt,
    };

    if (this.useInMemory) {
      const list = this.inMemoryEvidence.get(jobId) || [];
      list.push(receipt);
      this.inMemoryEvidence.set(jobId, list);
      return receipt;
    }

    const pool = await this.getPool();
    const res = await pool.query<EvidenceReceipt>(
      `INSERT INTO evidence_receipts (id, job_id, type, receipt_data, recorded_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, jobId, type, JSON.stringify(receiptData)]
    );
    return res.rows[0];
  }

  public async getEvidenceReceipts(jobId: string): Promise<EvidenceReceipt[]> {
    if (this.useInMemory) {
      return this.inMemoryEvidence.get(jobId) || [];
    }

    const pool = await this.getPool();
    const res = await pool.query<EvidenceReceipt>(
      'SELECT * FROM evidence_receipts WHERE job_id = $1 ORDER BY recorded_at ASC',
      [jobId]
    );
    return res.rows;
  }

  public async recordValidationResult(
    jobId: string,
    validationName: string,
    passed: boolean,
    details: Record<string, unknown>
  ): Promise<ValidationResult> {
    const id = generateUUID();
    const validatedAt = new Date().toISOString();
    const result: ValidationResult = {
      id,
      job_id: jobId,
      validation_name: validationName,
      passed,
      details,
      validated_at: validatedAt,
    };

    if (this.useInMemory) {
      const list = this.inMemoryValidation.get(jobId) || [];
      list.push(result);
      this.inMemoryValidation.set(jobId, list);
      return result;
    }

    const pool = await this.getPool();
    const res = await pool.query<ValidationResult>(
      `INSERT INTO validation_results (id, job_id, validation_name, passed, details, validated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [id, jobId, validationName, passed, JSON.stringify(details)]
    );
    return res.rows[0];
  }

  public async getValidationResults(jobId: string): Promise<ValidationResult[]> {
    if (this.useInMemory) {
      return this.inMemoryValidation.get(jobId) || [];
    }

    const pool = await this.getPool();
    const res = await pool.query<ValidationResult>(
      'SELECT * FROM validation_results WHERE job_id = $1 ORDER BY validated_at ASC',
      [jobId]
    );
    return res.rows;
  }

  public async getReceivedButNotQueuedJobs(): Promise<DurableJob[]> {
    if (this.useInMemory) {
      return Array.from(this.inMemoryJobs.values()).filter(
        (job) => job.status === 'received'
      );
    }

    const pool = await this.getPool();
    const res = await pool.query<DurableJob>(
      "SELECT * FROM jobs WHERE status = 'received' ORDER BY created_at ASC"
    );
    return res.rows;
  }

  public async getStaleRunningJobs(cutoffIso: string): Promise<DurableJob[]> {
    if (this.useInMemory) {
      return Array.from(this.inMemoryJobs.values()).filter(
        (job) =>
          job.status === 'running' &&
          job.deadline_at !== null &&
          job.deadline_at !== undefined &&
          job.deadline_at < cutoffIso
      );
    }

    const pool = await this.getPool();
    const res = await pool.query<DurableJob>(
      "SELECT * FROM jobs WHERE status = 'running' AND deadline_at IS NOT NULL AND deadline_at < $1 ORDER BY deadline_at ASC",
      [cutoffIso]
    );
    return res.rows;
  }
}

export const defaultLedger = new DurableLedger();
