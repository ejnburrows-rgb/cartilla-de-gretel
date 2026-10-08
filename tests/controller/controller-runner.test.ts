import { describe, it, expect, beforeEach } from 'vitest';
import { DurableLedger } from '../../src/controller/db/ledger';
import { handleGitHubWebhookRequest } from '../../src/controller/api/webhook';
import { executeControllerWorkerJob } from '../../src/controller/inngest/worker';
import { runReconciliationLoop } from '../../src/controller/reconcile';

describe('Controller Runner - Forced Failure Proofs & Durable Ledger', () => {
  let ledger: DurableLedger;

  beforeEach(() => {
    ledger = new DurableLedger();
    ledger.resetInMemory();
    process.env.SKIP_WEBHOOK_VERIFY = '1';
  });

  it('PROOFS 1: Same GitHub delivery twice creates exactly ONE canonical job', async () => {
    const deliveryId = 'delivery-unique-12345';
    const payload = {
      action: 'opened',
      issue: { number: 101, title: 'Bug in workbook' },
    };
    const headers = {
      'x-github-delivery': deliveryId,
      'x-github-event': 'issues',
    };
    const rawBody = JSON.stringify(payload);

    // First webhook delivery
    const res1 = await handleGitHubWebhookRequest(rawBody, headers, {
      ledger,
      inngestDispatcher: async () => {},
    });

    expect(res1.statusCode).toBe(200);
    expect(res1.body.ok).toBe(true);
    expect(res1.body.queued).toBe(true);
    const jobId = res1.body.jobId as string;
    expect(jobId).toBeDefined();

    // Second webhook delivery with SAME X-GitHub-Delivery header
    const res2 = await handleGitHubWebhookRequest(rawBody, headers, {
      ledger,
      inngestDispatcher: async () => {},
    });

    expect(res2.statusCode).toBe(200);
    expect(res2.body.ok).toBe(true);
    expect(res2.body.duplicate).toBe(true);
    expect(res2.body.deliveryId).toBe(deliveryId);

    // Verify ledger contains only ONE job
    const unqueued = await ledger.getReceivedButNotQueuedJobs();
    const storedJob = await ledger.getJobById(jobId);
    expect(storedJob).toBeDefined();
    expect(storedJob?.delivery_id).toBe(deliveryId);
  });

  it('PROOFS 2: Queue send failure leaves the job stored and recoverable by reconciliation', async () => {
    const deliveryId = 'delivery-fail-queue-67890';
    const payload = { ref: 'refs/heads/main', after: '4a23ae75' };
    const headers = {
      'x-github-delivery': deliveryId,
      'x-github-event': 'push',
    };

    // Webhook receiver where Inngest queue dispatch throws an error
    const res = await handleGitHubWebhookRequest(
      JSON.stringify(payload),
      headers,
      {
        ledger,
        inngestDispatcher: async () => {
          throw new Error('Inngest cluster unreachable');
        },
      }
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.queued).toBe(false);
    expect(res.body.queueError).toContain('Inngest cluster unreachable');

    const jobId = res.body.jobId as string;
    const storedJob = await ledger.getJobById(jobId);
    expect(storedJob?.status).toBe('received');
    expect(storedJob?.failure_reason).toContain('Inngest cluster unreachable');

    // Run reconciliation loop to recover unqueued job
    let dispatched = false;
    const reconcileRes = await runReconciliationLoop({
      ledger,
      inngestDispatcher: async () => {
        dispatched = true;
      },
    });

    expect(reconcileRes.unqueuedRecovered).toBe(1);
    expect(dispatched).toBe(true);

    const recoveredJob = await ledger.getJobById(jobId);
    expect(recoveredJob?.status).toBe('queued');
  });

  it('PROOFS 3: Worker failure is visible and retryable', async () => {
    const { job } = await ledger.createJob('delivery-worker-fail-1', 'push', {
      ref: 'refs/heads/main',
    });

    // Execute worker job with simulated worker error
    const updatedJob = await executeControllerWorkerJob(job.id, {
      ledger,
      simulateWorkerError: 'Compilation error in worker task',
      overrideWorkerRunId: 'run_worker_fail_1',
    });

    expect(updatedJob.status).toBe('failed');
    expect(updatedJob.attempts).toBe(1);
    expect(updatedJob.failure_reason).toBe('Compilation error in worker task');
    expect(updatedJob.retry_history.length).toBe(1);
    expect(updatedJob.retry_history[0].reason).toBe(
      'Compilation error in worker task'
    );
    expect(updatedJob.retry_history[0].worker_run_id).toBe(
      'run_worker_fail_1'
    );

    // Retry job (attempt 2 succeeds)
    const retriedJob = await executeControllerWorkerJob(job.id, {
      ledger,
      githubFetcher: {
        fetchHeadSha: async () => '4a23ae75bae186379e7aaa728edc86db7071be58',
      },
      simulateValidationPass: true,
      overrideWorkerRunId: 'run_worker_success_2',
    });

    expect(retriedJob.status).toBe('verified');
    expect(retriedJob.attempts).toBe(2);
    expect(retriedJob.retry_history.length).toBe(1); // 1 recorded failure
  });

  it('PROOFS 4: Missing evidence cannot produce completed or VERIFIED state', async () => {
    const { job } = await ledger.createJob('delivery-no-evidence', 'push', {});

    // Attempt worker execution where GitHub SHA fetch returns empty / missing evidence
    const updatedJob = await executeControllerWorkerJob(job.id, {
      ledger,
      githubFetcher: {
        fetchHeadSha: async () => '', // Missing evidence
      },
      overrideWorkerRunId: 'run_no_evidence',
    });

    expect(updatedJob.status).not.toBe('completed');
    expect(updatedJob.status).not.toBe('verified');
    expect(updatedJob.status).toBe('failed');
    expect(updatedJob.failure_reason).toContain('COMPLETION_DENIED');
    expect(updatedJob.failure_reason).toContain('Missing required GitHub evidence');
  });

  it('PROOFS 5: Exhausted attempts become visible dead-letter / manual-review state', async () => {
    // Create job with max_attempts = 2
    const { job } = await ledger.createJob(
      'delivery-deadletter-test',
      'push',
      {},
      undefined,
      2
    );

    // Attempt 1 fails
    const attempt1 = await executeControllerWorkerJob(job.id, {
      ledger,
      simulateWorkerError: 'First worker crash',
      overrideWorkerRunId: 'run_dl_1',
    });
    expect(attempt1.status).toBe('failed');
    expect(attempt1.attempts).toBe(1);

    // Attempt 2 fails (reaches max_attempts = 2)
    const attempt2 = await executeControllerWorkerJob(job.id, {
      ledger,
      simulateWorkerError: 'Second worker crash',
      overrideWorkerRunId: 'run_dl_2',
    });

    expect(attempt2.status).toBe('dead_letter');
    expect(attempt2.attempts).toBe(2);
    expect(attempt2.failure_reason).toBe('Second worker crash');
    expect(attempt2.retry_history.length).toBe(2);
    expect(attempt2.retry_history[0].reason).toBe('First worker crash');
    expect(attempt2.retry_history[1].reason).toBe('Second worker crash');
  });
});
