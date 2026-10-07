BEGIN;
CREATE SCHEMA IF NOT EXISTS cartilla_controller;
SET LOCAL search_path TO cartilla_controller;
CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS webhook_events(delivery_id text PRIMARY KEY,event_type text NOT NULL,raw_body text NOT NULL,payload jsonb NOT NULL,received_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS jobs(
 id uuid PRIMARY KEY,idempotency_key text UNIQUE NOT NULL,delivery_id text REFERENCES webhook_events(delivery_id),
 kind text NOT NULL CHECK(kind IN('reconcile','repo_inspection','issue_implementation')),
 source jsonb NOT NULL,spec jsonb NOT NULL DEFAULT '{}',issue_number integer,
 status text NOT NULL DEFAULT 'received' CHECK(status IN('received','queued','running','waiting','retrying','blocked','failed','dead_letter','verified','cancelled')),
 attempt_count integer NOT NULL DEFAULT 0,max_attempts integer NOT NULL DEFAULT 3,
 deadline timestamptz,retry_at timestamptz,lease_until timestamptz,
 failure_reason text,next_action text NOT NULL DEFAULT 'Queue durable execution',owner_action text NOT NULL DEFAULT 'Nothing',
 starting_sha text,worker text,external_id text,queue_generation integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS job_transitions(id bigserial PRIMARY KEY,job_id uuid NOT NULL REFERENCES jobs(id),from_status text,to_status text NOT NULL,reason text,recorded_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS job_attempts(
 id uuid PRIMARY KEY,job_id uuid NOT NULL REFERENCES jobs(id),attempt_number integer NOT NULL,
 worker text NOT NULL,external_id text,start_task_id text,payload_hash text NOT NULL,starting_sha text NOT NULL,
 state text NOT NULL CHECK(state IN('reserved','running','finished','failed','ambiguous','cancel_requested')),
 deadline timestamptz NOT NULL,dispatched_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(job_id,attempt_number)
);
CREATE TABLE IF NOT EXISTS evidence_receipts(id uuid PRIMARY KEY,job_id uuid NOT NULL REFERENCES jobs(id),attempt_id uuid REFERENCES job_attempts(id),kind text NOT NULL,data jsonb NOT NULL,recorded_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS project_snapshots(id uuid PRIMARY KEY,main_sha text NOT NULL,data jsonb NOT NULL,recorded_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS validations(id uuid PRIMARY KEY,job_id uuid NOT NULL REFERENCES jobs(id),attempt_id uuid REFERENCES job_attempts(id),passed boolean NOT NULL,name text NOT NULL,details jsonb NOT NULL,recorded_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS dead_letters(id uuid PRIMARY KEY,job_id uuid NOT NULL REFERENCES jobs(id),reason text NOT NULL,resolved_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS controller_guard(id integer PRIMARY KEY CHECK(id=1));
INSERT INTO controller_guard(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE INDEX IF NOT EXISTS jobs_due ON jobs(status,retry_at,updated_at);
CREATE INDEX IF NOT EXISTS attempts_active ON job_attempts(state,dispatched_at);
CREATE INDEX IF NOT EXISTS receipts_job ON evidence_receipts(job_id,recorded_at);
CREATE OR REPLACE FUNCTION record_transition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  INSERT INTO job_transitions(job_id,to_status,reason) VALUES(NEW.id,NEW.status,NEW.failure_reason);
 ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
  INSERT INTO job_transitions(job_id,from_status,to_status,reason) VALUES(NEW.id,OLD.status,NEW.status,NEW.failure_reason);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS jobs_transition ON jobs;
CREATE TRIGGER jobs_transition AFTER INSERT OR UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION record_transition();
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
COMMIT;
