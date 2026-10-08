-- Neon Postgres Schema for Durable Cartilla Event Controller & Job Ledger

CREATE TABLE IF NOT EXISTS webhook_events (
  delivery_id VARCHAR(255) PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  delivery_id VARCHAR(255) REFERENCES webhook_events(delivery_id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('received', 'queued', 'running', 'completed', 'verified', 'failed', 'dead_letter')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  worker_run_id VARCHAR(255),
  deadline_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence_receipts (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  receipt_data JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS validation_results (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  validation_name VARCHAR(100) NOT NULL,
  passed BOOLEAN NOT NULL,
  details JSONB NOT NULL,
  validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_idempotency_key ON jobs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_evidence_receipts_job_id ON evidence_receipts(job_id);
