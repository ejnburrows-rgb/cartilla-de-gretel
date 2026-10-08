import { DurableLedger, defaultLedger } from './db/ledger';
import { executeControllerWorkerJob } from './inngest/worker';

export interface ReconcileResult {
  ok: boolean;
  unqueuedRecovered: number;
  staleJobsRecovered: number;
  deadLettered: number;
  errors: string[];
}

export async function runReconciliationLoop(
  options: {
    ledger?: DurableLedger;
    inngestDispatcher?: (jobId: string, idempotencyKey: string) => Promise<void>;
  } = {}
): Promise<ReconcileResult> {
  const ledger = options.ledger || defaultLedger;
  const result: ReconcileResult = {
    ok: true,
    unqueuedRecovered: 0,
    staleJobsRecovered: 0,
    deadLettered: 0,
    errors: [],
  };

  // 1. Find received-but-not-queued jobs
  const unqueuedJobs = await ledger.getReceivedButNotQueuedJobs();
  for (const job of unqueuedJobs) {
    try {
      if (options.inngestDispatcher) {
        await options.inngestDispatcher(job.id, job.idempotency_key);
      } else {
        const { inngest } = await import('./inngest/client');
        await inngest.send({
          name: 'cartilla/job.created',
          data: {
            jobId: job.id,
            idempotencyKey: job.idempotency_key,
            deliveryId: job.delivery_id,
            eventType: job.event_type,
          },
        });
      }
      await ledger.updateJobStatus(job.id, { status: 'queued' });
      result.unqueuedRecovered++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Failed to enqueue received job ${job.id}: ${msg}`);
    }
  }

  // 2. Find stale running jobs past deadline
  const nowIso = new Date().toISOString();
  const staleJobs = await ledger.getStaleRunningJobs(nowIso);

  for (const job of staleJobs) {
    try {
      const reason = `Worker execution timed out (deadline was ${job.deadline_at})`;
      const isExhausted = job.attempts >= job.max_attempts;

      if (isExhausted) {
        await ledger.updateJobStatus(job.id, {
          status: 'dead_letter',
          failure_reason: reason,
          addRetryHistory: {
            attempt: job.attempts,
            failed_at: new Date().toISOString(),
            reason,
            worker_run_id: job.worker_run_id || undefined,
          },
        });
        result.deadLettered++;
      } else {
        // Mark failed and trigger recovery re-execution
        await ledger.updateJobStatus(job.id, {
          status: 'failed',
          failure_reason: reason,
          addRetryHistory: {
            attempt: job.attempts,
            failed_at: new Date().toISOString(),
            reason,
            worker_run_id: job.worker_run_id || undefined,
          },
        });

        // Re-execute worker or re-queue
        if (options.inngestDispatcher) {
          await options.inngestDispatcher(job.id, job.idempotency_key);
        } else {
          await executeControllerWorkerJob(job.id, { ledger });
        }
        result.staleJobsRecovered++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Failed recovering stale job ${job.id}: ${msg}`);
    }
  }

  return result;
}
